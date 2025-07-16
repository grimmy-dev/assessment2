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
from fastapi.middleware.cors import CORSMiddleware

from .connection_manager import ConnectionManager
from .routes.ingestion_pipeline import CSVProcessor

app = FastAPI(title="CSV Processing API")

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


@app.get("/result/{task_id}")
async def get_result(task_id: str):
    """Get processing result"""
    result = csv_processor.get_result(task_id)
    if not result:
        raise HTTPException(
            status_code=404, detail="Task not found or still processing"
        )
    return result


@app.get("/status/{task_id}")
async def get_status(task_id: str):
    """Get task status"""
    result = csv_processor.get_result(task_id)
    active_tasks = csv_processor.get_active_tasks()

    return {
        "task_id": task_id,
        "is_processing": task_id in active_tasks,
        "has_result": result is not None,
        "websocket_connected": connection_manager.get_connection_status(task_id),
        "queued_messages": connection_manager.get_queued_message_count(task_id),
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


@app.get("/preview/{task_id}")
async def get_data_preview(task_id: str, n: int = 200):
    df = csv_processor.get_processed_data(task_id)
    if df is None:
        raise HTTPException(status_code=404, detail="Task not found")

    # Clamp to reasonable max
    n = min(n, 1000)
    try:
        return {"data": df.head(n).to_dicts(), "columns": df.columns}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching preview: {e}")


@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "CSV Processing API", "version": "1.0.0", "docs": "/docs"}


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
