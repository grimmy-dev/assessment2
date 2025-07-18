## `CSVProcessor` Class

A helper class to handle CSV processing in the background.
It reads a CSV file, cleans the data, detects potential target columns, and logs progress using a WebSocket connection.

### `__init__(self, connection_manager: ConnectionManager)`

Initializes the CSV processor.

- **connection_manager**: A WebSocket manager used to send logs to the frontend.
- Sets up storage for processed data, results, and active background tasks.

---

### `async def process_csv(self, file_content: bytes, task_id: str) -> ProcessingResult`

Reads and processes a CSV file, step by step. Sends progress logs to the frontend.

#### What it does:

1. Sends a “processing started” log.
2. Tries to read the CSV file.
3. Cleans the data:

   - Removes empty columns.
   - Removes duplicate rows.
   - Fills missing values (with median for numbers or "Unknown" for text).

4. Identifies possible target columns (used for predictions later).
5. Stores the cleaned data and result.
6. Sends a final summary log.
7. If anything fails, logs an error and stores a failure result.

#### Parameters:

- **file_content**: The raw bytes of the uploaded CSV file.
- **task_id**: A unique ID used to track logs and results for this processing task.

#### Returns:

- A `ProcessingResult` object that includes rows, columns, and target column suggestions.

---

### `async def start_processing(self, file_content: bytes, task_id: str)`

Starts the `process_csv` method in the background so it doesn’t block other tasks.

#### What it does:

- Runs the CSV processing in a separate async task.
- Keeps track of the task so it can be cancelled or checked later.
- Automatically removes it from the tracker when done.

#### Parameters:

- **file_content**: Raw CSV data in bytes.
- **task_id**: Unique ID for this task.

#### Returns:

- The background task object.

---

### `def get_processed_data(self, task_id: str) -> pl.DataFrame`

Gets the processed DataFrame for a given task.

#### Parameters:

- **task_id**: The ID of the task.

#### Returns:

- The cleaned Polars DataFrame, or `None` if it doesn't exist.

---

### `def cancel_task(self, task_id: str)`

Cancels a running background CSV processing task.

#### Parameters:

- **task_id**: The ID of the task to cancel.

---

### `def get_active_tasks(self) -> List[str]`

Returns a list of all task IDs that are still running.

#### Returns:

- A list of strings (task IDs).
