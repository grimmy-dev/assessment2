# CSV Data Profiler API — Developer Notes

This FastAPI service allows users to:

- Upload a CSV file
- Receive a real-time processing log (via WebSocket)
- Profile and visualize data
- Train a machine learning model (classification/regression)
- Make predictions based on trained models

---

## General Workflow

1. Client uploads CSV to `/upload`
2. Server processes the CSV in background
3. WebSocket `/ws/{task_id}` used for real-time status updates
4. User can fetch:

   - Full data profile from `/profile/{task_id}`
   - Chart-ready data from `/chart-data/{task_id}`
   - Model training via `/train`
   - Predictions via `/predict`

---

## Endpoints

GET /ws/{task_id}

- Opens a WebSocket for real-time logs
- Required during processing for status updates

POST /upload

- Accepts CSV file (max 50MB)
- Returns: task_id, filename, file size
- Starts processing in background

DELETE /cancel/{task_id}

- Cancels ongoing processing
- Disconnects any open WebSocket for this task

GET /profile/{task_id}

- Returns profiling details:

  - Column types
  - Missing values
  - Summary stats
  - Correlation matrix
  - Sample rows

GET /chart-data/{task_id}?x_axis=col\&y_axis=col\&chart_type=type

- Returns simplified data for frontend charts
- Supports: scatter, line, bar, pie, histogram
- Optional: y_axis (not needed for pie/histogram)

POST /train

- Trains a Random Forest model
- Input: task_id, target_column
- Output: model type, accuracy or R², feature info

POST /predict

- Makes a prediction using a trained model
- Input: task_id, input_data (as dict)
- Output: predicted value and class probabilities (if classification)

GET /model-info/{task_id}

- Fetches metadata about the trained model

GET /processed-data/{task_id}

- Returns columns, types, sample values, and task summary

GET /debug/{task_id}

- Developer endpoint to check:

  - Is task active
  - Does processed data exist
  - Keys in memory

GET /health

- Health check endpoint
- Returns status, timestamp, active task count

GET /

- Welcome endpoint
- Returns message and API version

---

## Shutdown Behavior

On application shutdown:

- Cancels all active tasks
- Disconnects all WebSocket connections
- Cleans up memory references

---

## System Components

- ConnectionManager
  Manages WebSocket connections and queued log messages

- CSVProcessor
  Handles CSV ingestion, async processing, and task lifecycle

- DataProfiler
  Analyzes structure, stats, data quality, and correlations

- MLProcessor
  Trains Random Forest models and performs predictions
