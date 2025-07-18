# Uploader Component Documentation

## Overview

The **Uploader** component handles CSV file upload, starts backend processing via the `/upload` endpoint,
opens a WebSocket connection for live log updates, shows upload progress, and manages upload lifecycle
including reset and cancel.

### Props

- `currentTaskId`: Backend task ID from upload
- `canFetchDashboard`: Indicates if data profile can be fetched
- `uploadStatus`: Tracks upload state (`idle`, `uploading`, `success`, `error`)
- `onTaskIdChange`: Callback to update parent with new `taskId`
- `onCanFetchChange`: Callback to mark readiness for dashboard
- `onUploadStatusChange`: Callback to update upload status
- `onReset`: Callback to reset global state (`taskId`, fetch flags`)

---

## Functions

### `scrollToBottom`

Scrolls the logs container to the bottom when new log messages arrive.

---

### `addLog`

Adds a log message with a timestamp and optional progress value.

---

### `connectWebSocket`

Opens a WebSocket connection using the task ID to receive real-time log updates.

---

### `handleUpload`

Uploads the selected CSV file to the backend and connects to WebSocket.

---

### `cancelTask`

Sends a cancel request to the backend and closes the WebSocket connection.

---

### `onSubmit`

Called when the file form is submitted; triggers the upload process.

---

### `handleReset`

Resets uploader state, cancels any running task, and clears form and logs.

---

### `getStatusIcon`

Returns a status icon based on the current upload status.

---

### `getCardStyle`

Returns conditional card styling based on upload status.
