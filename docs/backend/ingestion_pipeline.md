# CSV Processor Documentation

## Overview

The `CSVProcessor` class is a powerful async-enabled tool for processing CSV files with real-time progress tracking. It handles data cleaning, validation, and analysis while keeping clients updated through WebSocket connections.

Think of it as your smart CSV assistant that not only cleans your data but also tells you exactly what it's doing every step of the way.

## Key Features

- **Async Processing**: Handles large files without blocking
- **Real-time Progress**: Live updates via WebSocket connections
- **Smart Data Cleaning**: Removes empty columns, duplicates, and fills missing values
- **Target Column Detection**: Automatically finds columns suitable for analysis
- **Error Handling**: Comprehensive error reporting with detailed logging
- **Task Management**: Track and cancel running processes

## Class Structure

```python
class CSVProcessor:
    def __init__(self, connection_manager: ConnectionManager)
```

### Dependencies

- `polars`: Fast DataFrame library for data processing
- `asyncio`: For async operations and task management
- `ConnectionManager`: Handles WebSocket communications for progress updates

## Core Methods

### `process_csv(file_content: bytes, task_id: str) -> ProcessingResult`

The main workhorse method that processes your CSV file through several stages:

**What it does:**

1. **File Reading** (10%): Converts bytes to Polars DataFrame
2. **Data Validation** (20%): Checks for empty files or missing columns
3. **Structure Analysis** (30%): Examines data types and patterns
4. **Cleaning Operations**:
   - Remove empty columns (40%)
   - Remove duplicate rows (50-60%)
   - Fill missing values (70-75%)
5. **Target Detection** (80-85%): Identifies columns suitable for ML/analysis
6. **Results Storage** (90-100%): Saves processed data and metadata

**Parameters:**

- `file_content`: Raw CSV file as bytes
- `task_id`: Unique identifier for tracking this processing job

**Returns:**

- `ProcessingResult`: Object containing success status, row counts, column info, and identified target columns

**Example Usage:**

```python
processor = CSVProcessor(connection_manager)
result = await processor.process_csv(csv_bytes, "task_123")
print(f"Processed {result.cleaned_rows} rows successfully!")
```

### `start_processing(file_content: bytes, task_id: str)`

Kicks off processing in the background so your app stays responsive.

**What it does:**

- Creates an async task for CSV processing
- Stores the task for later reference/cancellation
- Sets up automatic cleanup when processing completes

**Why use this instead of `process_csv` directly?**

- Non-blocking: Your app can do other things while processing happens
- Cancellable: Users can stop long-running processes
- Trackable: You can monitor active tasks

### `get_processed_data(task_id: str) -> pl.DataFrame`

Retrieves the cleaned DataFrame after processing completes.

**Example:**

```python
# After processing is done
df = processor.get_processed_data("task_123")
print(df.head())  # Show first few rows
```

### `cancel_task(task_id: str)`

Stops a running processing task - useful for large files when users change their mind.

### `get_active_tasks() -> List[str]`

Returns list of currently running task IDs. Great for showing users what's happening in your app.

## Data Processing Pipeline

### 1. Data Loading & Validation

- Reads CSV using Polars (fast and memory-efficient)
- Validates file isn't empty
- Counts rows and columns for initial assessment

### 2. Smart Cleaning

**Empty Column Removal**: Drops columns that are completely null

```python
# Example: If a column has all null values, it gets removed
# Before: ['name', 'age', 'empty_col', 'city']
# After:  ['name', 'age', 'city']
```

**Duplicate Removal**: Keeps only unique rows

```python
# Before: 1000 rows with 50 duplicates
# After:  950 unique rows
```

**Missing Value Handling**:

- Numeric columns: Filled with median value
- Text columns: Filled with "Unknown"

### 3. Target Column Detection

The processor automatically identifies columns that might be good for machine learning or analysis:

**What makes a good target column?**

- Has between 2-9 unique values (not too sparse, not too dense)
- Doesn't contain excluded keywords like 'name', 'id', 'gender', etc.
- Can be analyzed (no parsing errors)

**Example:**

```python
# These columns would be flagged as potential targets:
# - 'status' (values: 'active', 'inactive', 'pending')
# - 'priority' (values: 'low', 'medium', 'high')
# - 'category' (values: 'A', 'B', 'C', 'D')

# These would be excluded:
# - 'customer_name' (too many unique values)
# - 'transaction_id' (excluded keyword + unique)
# - 'gender' (excluded keyword)
```

## Error Handling

The processor handles various error scenarios gracefully:

- **File Reading Errors**: Invalid CSV format, encoding issues
- **Empty Data**: Files with no rows or columns
- **Processing Errors**: Memory issues, corrupt data
- **WebSocket Errors**: Connection problems during progress updates

All errors are logged with descriptive messages and don't crash the system.

## Progress Tracking

Progress updates are sent at key milestones with meaningful messages:

```
5%:   "Starting CSV processing..."
10%:  "Reading CSV file..."
20%:  "Loaded 1000 rows, 15 columns"
30%:  "Analyzing data structure..."
40%:  "Removing empty columns..."
50%:  "Removing duplicate rows..."
70%:  "Handling missing values..."
80%:  "Identifying target columns..."
100%: "Processing completed successfully!"
```

## Quick Start

```python
# Basic usage
processor = CSVProcessor(connection_manager)
result = await processor.process_csv(csv_bytes, "task_123")

# Non-blocking processing
await processor.start_processing(csv_bytes, "task_123")
df = processor.get_processed_data("task_123")
```

The processor automatically cleans your CSV data and identifies useful columns for analysis.
