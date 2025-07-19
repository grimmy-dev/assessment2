# ConnectionManager Documentation

## Overview

The `ConnectionManager` class handles WebSocket connections for real-time communication between the server and clients. It manages multiple connections, queues messages when connections aren't available, and provides logging functionality.

## What It Does

- Manages WebSocket connections for different tasks
- Stores messages when connections aren't ready
- Sends real-time log messages to connected clients
- Handles connection failures gracefully

## Class Structure

### Properties

- `active_connections`: Stores currently connected WebSocket clients by task ID
- `message_queues`: Holds messages for tasks that don't have active connections yet
- `connection_locks`: Manages thread safety for each connection

## Methods

### `__init__()`

Sets up empty dictionaries to track connections, message queues, and locks.

### `connect(websocket, task_id)`

**Purpose**: Establishes a new WebSocket connection

**What it does**:

1. Accepts the WebSocket connection
2. Stores the connection using the task ID
3. Sends any messages that were queued while waiting for connection
4. Clears the message queue after sending

**Parameters**:

- `websocket`: The WebSocket connection object
- `task_id`: Unique identifier for the task/connection

### `disconnect(task_id)`

**Purpose**: Cleanly removes a connection and its data

**What it does**:

1. Removes the connection from active connections
2. Deletes any queued messages
3. Cleans up the connection lock

**Parameters**:

- `task_id`: ID of the connection to disconnect

### `send_log(task_id, level, message, progress=0, finished=False)`

**Purpose**: Sends log messages to clients in real-time

**What it does**:

1. Creates a log message with timestamp, level, content, and progress
2. If connection exists: sends message immediately
3. If no connection: queues the message for later
4. Limits queue size to 50 messages to prevent memory issues

**Parameters**:

- `task_id`: Target connection ID
- `level`: Log level (info, warning, error, etc.)
- `message`: The actual log content
- `progress`: Optional progress percentage (0-100)
- `finished`: Whether the task is complete

### `get_connection_status(task_id)`

**Purpose**: Check if a specific task has an active connection

**Returns**: `True` if connected, `False` if not

### `get_queued_message_count(task_id)`

**Purpose**: Get number of messages waiting to be sent

**Returns**: Number of queued messages for the task

## Key Features

### Message Queuing

If a client isn't connected yet, messages are stored in a queue. When the client connects later, all queued messages are sent immediately.

### Memory Management

Message queues are limited to 100 messages. If this limit is exceeded, only the most recent 50 messages are kept.

### Error Handling

If sending a message fails, the connection is automatically cleaned up to prevent stuck connections.

## Usage Example

```python
# Create manager
manager = ConnectionManager()

# Connect a client
await manager.connect(websocket, "task_123")

# Send a log message
await manager.send_log("task_123", "info", "Processing started", progress=10)

# Check connection status
is_connected = manager.get_connection_status("task_123")

# Disconnect when done
manager.disconnect("task_123")
```
