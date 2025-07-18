import asyncio
import uuid
from datetime import datetime

from fastapi import (
    FastAPI,
    File,
    UploadFile,
    WebSocket,
    WebSocketDisconnect,
    HTTPException,
)
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
import numpy as np
import polars as pl
from fastapi.middleware.cors import CORSMiddleware

from .types import (
    PredictionRequest,
    PredictionResponse,
    TrainModelRequest,
    TrainModelResponse,
)

from .connection_manager import ConnectionManager
from .routes.ingestion_pipeline import CSVProcessor
from .routes.profiler import DataProfiler
from .routes.ml_pipeline import MLProcessor

app = FastAPI(title="CSV Data Profiler API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize managers
connection_manager = ConnectionManager()
csv_processor = CSVProcessor(connection_manager)
ml_processor = MLProcessor()


@app.websocket("/ws/{task_id}")
async def websocket_endpoint(websocket: WebSocket, task_id: str):
    """WebSocket endpoint for real-time updates"""
    await connection_manager.connect(websocket, task_id)

    try:
        # Keep the connection alive
        while True:
            # Send ping to keep connection alive
            await asyncio.sleep(30)
            if connection_manager.get_connection_status(task_id):
                try:
                    await websocket.ping()
                except:
                    break
            else:
                break
    except WebSocketDisconnect:
        print(f"WebSocket disconnected for task: {task_id}")
    except Exception as e:
        print(f"WebSocket error for task {task_id}: {e}")
    finally:
        connection_manager.disconnect(task_id)


@app.post("/upload")
async def upload_csv(file: UploadFile = File(...)):
    """Upload CSV file and start processing"""

    # Validate file
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")

    # Read file content
    try:
        content = await file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read file: {str(e)}")

    # Check file size
    if len(content) > 50 * 1024 * 1024:  # 50MB
        raise HTTPException(status_code=400, detail="File too large (max 50MB)")

    if len(content) == 0:
        raise HTTPException(status_code=400, detail="File is empty")

    # Generate task ID
    task_id = str(uuid.uuid4())

    # Start processing in background
    try:
        await csv_processor.start_processing(content, task_id)
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to start processing: {str(e)}"
        )

    return {
        "task_id": task_id,
        "message": "Processing started",
        "filename": file.filename,
        "file_size": len(content),
    }


@app.delete("/cancel/{task_id}")
async def cancel_task(task_id: str):
    """Cancel a running task"""
    active_tasks = csv_processor.get_active_tasks()
    if task_id not in active_tasks:
        raise HTTPException(status_code=404, detail="Task not found or not running")

    csv_processor.cancel_task(task_id)
    connection_manager.disconnect(task_id)

    return {"message": f"Task {task_id} cancelled"}


@app.get("/profile/{task_id}")
async def get_data_profile(task_id: str):
    """Get comprehensive data profile"""
    df = csv_processor.get_processed_data(task_id)
    if df is None:
        raise HTTPException(
            status_code=404, detail="Task not found or data not processed yet"
        )

    try:
        profiler = DataProfiler(df)
        profile = profiler.generate_profile()

        return {
            "task_id": task_id,
            "profile": profile,
            "success": True,
            "message": "Profile generated successfully",
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error generating profile: {str(e)}"
        )


@app.get("/chart-data/{task_id}")
async def get_chart_data(
    task_id: str,
    x_axis: str,
    y_axis: str = None,
    chart_type: str = "scatter",
    limit: int = 200,
):
    """Get data for chart visualization"""
    df = csv_processor.get_processed_data(task_id)
    if df is None:
        raise HTTPException(status_code=404, detail="Task not found")

    try:
        # Validate columns exist
        if x_axis not in df.columns:
            raise HTTPException(status_code=400, detail=f"Column '{x_axis}' not found")

        if y_axis and y_axis not in df.columns:
            raise HTTPException(status_code=400, detail=f"Column '{y_axis}' not found")

        # Limit data for performance
        df_limited = df.head(limit)

        if chart_type == "histogram" and not y_axis:
            # For histogram, we just need x values
            data = [
                {"x": val} for val in df_limited[x_axis].to_list() if val is not None
            ]
        elif chart_type == "pie":
            # For pie chart, group by x_axis and count
            grouped = df_limited.group_by(x_axis).agg(pl.count().alias("count"))
            data = [
                {"name": str(row[x_axis]), "value": row["count"]}
                for row in grouped.to_dicts()
            ]
        else:
            # For scatter, line, bar charts
            if not y_axis:
                raise HTTPException(
                    status_code=400, detail="y_axis required for this chart type"
                )

            data = []
            for row in df_limited.to_dicts():
                x_val = row.get(x_axis)
                y_val = row.get(y_axis)

                if x_val is not None and y_val is not None:
                    data.append({"x": x_val, "y": y_val})

        return {
            "data": data,
            "x_axis": x_axis,
            "y_axis": y_axis,
            "chart_type": chart_type,
            "total_rows": len(df),
            "returned_rows": len(data),
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error preparing chart data: {str(e)}"
        )


@app.post("/train", response_model=TrainModelResponse)
async def train_model(request: TrainModelRequest):
    """Train a machine learning model"""
    try:
        # Get processed data
        df = csv_processor.get_processed_data(request.task_id)
        if df is None:
            raise HTTPException(
                status_code=404, detail="Task not found or data not processed"
            )

        # Train model
        result = ml_processor.train_model(request.task_id, df, request.target_column)

        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["error"])

        return TrainModelResponse(**result)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")


@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    """Make predictions using trained model"""
    try:
        result = ml_processor.predict(request.task_id, request.input_data)

        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["error"])

        return JSONResponse(
            content=jsonable_encoder(
                result,
                custom_encoder={
                    np.integer: lambda x: int(x),
                    np.floating: lambda x: float(x),
                    np.ndarray: lambda x: x.tolist(),
                    np.str_: lambda x: str(x),
                    np.str_: lambda x: str(x),
                },
            )
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@app.get("/model-info/{task_id}")
async def get_model_info(task_id: str):
    """Get model information"""
    info = ml_processor.get_model_info(task_id)
    if info is None:
        raise HTTPException(status_code=404, detail="Model not found")
    return info


@app.get("/processed-data/{task_id}")
async def get_processed_data_info(task_id: str):
    """Get information about processed data"""
    try:
        # Check if task exists at all
        if task_id not in csv_processor.processing_results:
            raise HTTPException(
                status_code=404,
                detail=f"Task {task_id} not found. Available tasks: {list(csv_processor.processing_results.keys())}",
            )

        # Check processing result
        result = csv_processor.processing_results[task_id]
        if not result.success:
            raise HTTPException(
                status_code=400, detail=f"Processing failed: {result.summary}"
            )

        df = csv_processor.get_processed_data(task_id)
        if df is None:
            raise HTTPException(
                status_code=404,
                detail=f"Processed data not found for task {task_id}. Processing may still be in progress.",
            )

        return {
            "columns": list(df.columns),
            "column_types": {col: str(df[col].dtype) for col in df.columns},
            "sample_values": {col: df[col].head(3).to_list() for col in df.columns},
            "shape": df.shape,
            "processing_result": {
                "success": result.success,
                "summary": result.summary,
                "target_columns": result.target_columns,
            },
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to get data info: {str(e)}"
        )


@app.get("/debug/{task_id}")
async def debug_task(task_id: str):
    """Debug endpoint to check task status"""
    return {
        "task_id": task_id,
        "has_processed_data": task_id in csv_processor.processed_data,
        "has_processing_result": task_id in csv_processor.processing_results,
        "is_active_task": task_id in csv_processor.active_tasks,
        "active_tasks": list(csv_processor.active_tasks.keys()),
        "processed_data_keys": list(csv_processor.processed_data.keys()),
        "processing_results_keys": list(csv_processor.processing_results.keys()),
        "active_connections": list(connection_manager.active_connections.keys()),
    }


@app.get("/health")
async def health():
    """Health check endpoint"""
    active_tasks = csv_processor.get_active_tasks()
    return {
        "status": "ok",
        "timestamp": datetime.now().isoformat(),
        "active_tasks": len(active_tasks),
        "active_connections": len(connection_manager.active_connections),
    }


@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "CSV Data Profiler API", "version": "1.0.0", "docs": "/docs"}


# Graceful shutdown
@app.on_event("shutdown")
async def shutdown_event():
    """Clean up on shutdown"""
    # Cancel all active tasks
    active_tasks = csv_processor.get_active_tasks()
    for task_id in active_tasks:
        csv_processor.cancel_task(task_id)

    # Close all WebSocket connections
    for task_id in list(connection_manager.active_connections.keys()):
        connection_manager.disconnect(task_id)

    print("Server shutdown complete")
