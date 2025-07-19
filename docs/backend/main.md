# CSV Data Profiler API Documentation

## Overview

This is a FastAPI application that provides a complete data processing and machine learning pipeline for CSV files. It handles file uploads, data profiling, visualization, and ML model training with real-time progress updates via WebSockets.

## Key Features

- **CSV File Processing**: Upload and analyze CSV files
- **Real-time Updates**: WebSocket connections for live progress tracking
- **Data Profiling**: Generate comprehensive data analysis reports
- **Chart Data**: Create visualizations from your data
- **Machine Learning**: Train models and make predictions
- **Task Management**: Track and cancel running operations

## Application Setup

### Middleware

- **CORS**: Allows cross-origin requests from any domain
- **File Upload**: Supports CSV files up to 50MB

### Core Components

- **ConnectionManager**: Handles WebSocket connections
- **CSVProcessor**: Processes uploaded CSV files
- **MLProcessor**: Manages machine learning operations
- **DataProfiler**: Generates data analysis reports

## API Endpoints

### WebSocket Connection

**Endpoint**: `/ws/{task_id}`
**Purpose**: Real-time communication for task updates

**How it works**:

- Connects client to receive live updates
- Sends ping messages every 30 seconds to keep connection alive
- Automatically handles disconnections

### File Upload

**Endpoint**: `POST /upload`
**Purpose**: Upload CSV files for processing

**What it does**:

1. Validates the file is CSV format
2. Checks file size (max 50MB) and ensures it's not empty
3. Generates a unique task ID
4. Starts background processing
5. Returns task information

**Response**:

```json
{
  "task_id": "uuid-string",
  "message": "Processing started",
  "filename": "data.csv",
  "file_size": 12345
}
```

### Cancel Task

**Endpoint**: `DELETE /cancel/{task_id}`
**Purpose**: Stop a running processing task

**What it does**:

- Checks if task exists and is running
- Cancels the background processing
- Disconnects associated WebSocket connection

### Get Data Profile

**Endpoint**: `GET /profile/{task_id}`
**Purpose**: Get comprehensive analysis of your data

**What you get**:

- Column statistics (mean, median, min, max)
- Data type information
- Missing value counts
- Distribution analysis
- Data quality insights

### Get Chart Data

**Endpoint**: `GET /chart-data/{task_id}`
**Purpose**: Get data formatted for creating charts

**Parameters**:

- `x_axis`: Column for X-axis
- `y_axis`: Column for Y-axis (optional for some chart types)
- `chart_type`: Type of chart (scatter, histogram, pie, line, bar)
- `limit`: Maximum number of data points (default: 200)

**Supported Chart Types**:

- **Histogram**: Shows distribution of values
- **Pie Chart**: Shows proportions of categories
- **Scatter Plot**: Shows relationship between two variables
- **Line/Bar Charts**: Compares values across categories

### Machine Learning

#### Train Model

**Endpoint**: `POST /train`
**Purpose**: Train a machine learning model on your data

**Request Body**:

```json
{
  "task_id": "your-task-id",
  "target_column": "column-to-predict"
}
```

**What it does**:

- Uses your processed data
- Automatically selects appropriate ML algorithm
- Trains and validates the model
- Returns performance metrics

#### Make Predictions

**Endpoint**: `POST /predict`
**Purpose**: Use trained model to make predictions

**Request Body**:

```json
{
  "task_id": "your-task-id",
  "input_data": {
    "column1": "value1",
    "column2": "value2"
  }
}
```

### Information Endpoints

#### Model Information

**Endpoint**: `GET /model-info/{task_id}`
**Purpose**: Get details about your trained model

- Model type and parameters
- Training performance metrics
- Feature importance

#### Processed Data Info

**Endpoint**: `GET /processed-data/{task_id}`
**Purpose**: Get information about your processed dataset

- Column names and types
- Sample values from each column
- Data shape (rows, columns)
- Processing results summary

#### Debug Information

**Endpoint**: `GET /debug/{task_id}`
**Purpose**: Debug endpoint to check task status

- Shows internal state of your task
- Lists all active tasks and connections
- Helps troubleshoot issues

### System Endpoints

#### Health Check

**Endpoint**: `GET /health`
**Purpose**: Check if the API is running properly

- System status
- Number of active tasks
- Number of active connections
- Current timestamp

#### Root

**Endpoint**: `GET /`
**Purpose**: Basic API information

- API name and version
- Link to documentation

## How to Use

### Basic Workflow

1. **Upload CSV**: Post your file to `/upload` and get a task ID
2. **Monitor Progress**: Connect to WebSocket `/ws/{task_id}` for updates
3. **Get Profile**: Once processing is done, call `/profile/{task_id}`
4. **Create Charts**: Use `/chart-data/{task_id}` to visualize data
5. **Train ML Model**: Use `/train` to create predictive models
6. **Make Predictions**: Use `/predict` to get predictions from your model

### Error Handling

- **400 Bad Request**: Invalid input (wrong file type, missing parameters)
- **404 Not Found**: Task doesn't exist or data not ready
- **500 Internal Server Error**: Processing errors

### File Restrictions

- Only CSV files are supported
- Maximum file size: 50MB
- Files cannot be empty
- Files must be valid CSV format

## Real-time Updates

The WebSocket connection provides live updates during processing:

- Progress percentage
- Current processing step
- Error messages if something goes wrong
- Completion notifications

## Shutdown Behavior

When the server shuts down:

- All active tasks are cancelled
- All WebSocket connections are closed
- Resources are cleaned up properly

This ensures no data is left in an inconsistent state and all operations complete gracefully.
