## `ConnectionManager` Class

This class manages WebSocket connections for real-time communication during tasks like CSV processing or model training.
It handles:

- Connecting and disconnecting clients
- Sending live log updates
- Queuing messages if a connection isn’t ready yet

---

### `__init__(self)`

Initializes the manager.

- `active_connections`: Keeps track of connected WebSocket clients by `task_id`.
- `message_queues`: Stores log messages if the client hasn't connected yet.
- `connection_locks`: (Optional use) You can use this for thread-safe operations per task.

---

### `async def connect(self, websocket: WebSocket, task_id: str)`

Handles a new WebSocket connection.

#### What it does:

- Accepts the WebSocket connection.
- Stores it in `active_connections`.
- Sends any messages that were queued before the client connected.

#### Parameters:

- `websocket`: The client's WebSocket connection.
- `task_id`: A unique ID for this processing task/client.

---

### `def disconnect(self, task_id: str)`

Closes the WebSocket connection and cleans up resources.

#### What it does:

- Removes the task’s connection and message queue if they exist.
- Cleans up any locks for that task.

#### Parameters:

- `task_id`: The ID of the client/task to disconnect.

---

### `async def send_log(...)`

Sends a log message to the frontend in real-time.

#### Parameters:

- `task_id`: The task/client ID to send the log to.
- `level`: Log level (e.g., `"info"`, `"error"`, `"success"`).
- `message`: The message to display.
- `progress`: (optional) A number from 0 to 100 to show progress.
- `finished`: (optional) If `True`, marks this task as finished.

#### What it does:

- Creates a `LogMessage` with timestamp and progress info.
- If the client is connected, it sends the message immediately.
- If not connected yet, it queues the message.
- It also limits queued messages to prevent memory overload.

---

### `def get_connection_status(self, task_id: str) -> bool`

Checks if a client is currently connected.

#### Returns:

- `True` if the client is connected, `False` otherwise.

---

### `def get_queued_message_count(self, task_id: str) -> int`

Gets the number of log messages waiting to be sent (if the client hasn’t connected yet).

#### Returns:

- The number of queued messages for the given task.
