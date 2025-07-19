# Uploader Component Documentation

## Overview

The Uploader component is a React component that handles CSV file uploads with real-time progress tracking. It provides a complete user interface for selecting, uploading, and monitoring the processing of CSV files through WebSocket connections.

## Key Features

- **File Upload**: Drag-and-drop or click to select CSV files
- **Real-time Progress**: Live updates during file processing
- **WebSocket Connection**: Real-time communication with the server
- **Form Validation**: Client-side validation for file type and size
- **Error Handling**: Comprehensive error messages and recovery
- **Log Display**: Collapsible log viewer for debugging
- **Task Management**: Cancel running tasks and reset the interface

## Component Structure

### Props Interface

```typescript
interface UploaderProps {
  currentTaskId: string | null; // Current processing task ID
  canFetchDashboard: boolean; // Whether dashboard can load data
  uploadStatus: UploadStatus; // Current upload state
  onTaskIdChange: (taskId: string | null) => void; // Task ID change handler
  onCanFetchChange: (canFetch: boolean) => void; // Dashboard state handler
  onUploadStatusChange: (status: UploadStatus) => void; // Status change handler
  onReset: () => void; // Global reset handler
}
```

### Upload Status Types

- `"idle"`: No upload in progress
- `"uploading"`: File is being processed
- `"success"`: Upload completed successfully
- `"error"`: Upload failed

## Core Functionality

### File Validation

The component validates files using Zod schema:

- **File Type**: Must be CSV (.csv extension)
- **File Size**: Maximum 50MB
- **File Required**: At least one file must be selected

### WebSocket Connection

**Purpose**: Real-time communication during processing

**How it works**:

1. Connects when upload starts using task ID
2. Receives progress updates and log messages
3. Auto-reconnects if connection is lost
4. Closes when processing completes

**Message Format**:

```typescript
type LogMessage = {
  timestamp: string;
  level: "info" | "success" | "error";
  message: string;
  progress?: number;
  finished?: boolean;
};
```

### Upload Process

1. **File Selection**: User selects CSV file through file input
2. **Validation**: Client-side validation checks file type and size
3. **Upload**: File is sent to server via FormData
4. **WebSocket**: Connection established for real-time updates
5. **Processing**: Server processes file with live progress updates
6. **Completion**: Success or error state with appropriate UI updates

## UI Components

### File Upload Card

- **Dynamic Styling**: Changes color based on upload status
  - Green: Success
  - Red: Error
  - Blue: Processing
  - Default: Idle
- **Status Icons**: Visual indicators for each state
- **Progress Bar**: Shows processing progress percentage

### File Display

When a file is selected:

- Shows file name and size
- File icon for visual confirmation
- File size in MB format

### Action Buttons

**Upload Button**:

- Disabled during processing
- Shows loading spinner when active
- Animated upload icon on hover

**Cancel Button**:

- Only visible during upload
- Cancels current processing task

**View Data Button**:

- Only visible after successful upload
- Links to dashboard section

**Reset Button**:

- Clears all data and starts over
- Available after upload attempt

### Logs Section

**Collapsible Accordion**:

- Shows number of log entries
- Auto-scrolls to bottom for new messages
- Color-coded log levels (info=blue, success=green, error=red)
- Timestamps for each log entry

## State Management

### Local State

- `uploadProgress`: Current processing percentage
- `uploadedFile`: Selected file information
- `logs`: Array of log messages
- `connectionStatus`: WebSocket connection state

### Global State (via Props)

- `currentTaskId`: Shared across components
- `canFetchDashboard`: Controls dashboard data loading
- `uploadStatus`: Overall upload state

## Error Handling

### Network Errors

- Displays error messages in logs
- Automatically attempts WebSocket reconnection
- Graceful fallback for failed uploads

### Validation Errors

- Real-time form validation
- Clear error messages for:
  - Wrong file type
  - File too large
  - No file selected

### Processing Errors

- Server errors displayed in logs
- WebSocket disconnection handling
- Task cancellation support

## Accessibility Features

- **Form Labels**: Proper labeling for screen readers
- **Keyboard Navigation**: Full keyboard support
- **Focus Management**: Logical tab order
- **Color Contrast**: Sufficient contrast for all states
- **Error Announcements**: Form validation messages

## Integration

### API Integration

- **Upload Endpoint**: `POST /upload`
- **Cancel Endpoint**: `DELETE /cancel/{taskId}`
- **WebSocket**: `ws://localhost:8000/ws/{taskId}`

### Dashboard Integration

- Passes task ID to Dashboard component
- Controls when dashboard can fetch data
- Seamless transition from upload to data view

## Usage Example

```jsx
function App() {
  const [taskId, setTaskId] = useState(null);
  const [canFetch, setCanFetch] = useState(false);
  const [status, setStatus] = useState("idle");

  const handleReset = () => {
    setTaskId(null);
    setCanFetch(false);
    setStatus("idle");
  };

  return (
    <Uploader
      currentTaskId={taskId}
      canFetchDashboard={canFetch}
      uploadStatus={status}
      onTaskIdChange={setTaskId}
      onCanFetchChange={setCanFetch}
      onUploadStatusChange={setStatus}
      onReset={handleReset}
    />
  );
}
```

## Performance Considerations

- **Auto-scroll**: Efficiently scrolls logs container
- **WebSocket Management**: Proper cleanup on unmount
- **Memory Management**: Limits log storage to prevent memory leaks
- **Reconnection Logic**: Smart reconnection with timeout

## Dependencies

- **React Hook Form**: Form management and validation
- **Zod**: Schema validation
- **Lucide React**: Icons
- **Next.js**: Routing and Link components
- **Custom UI Components**: Card, Button, Progress, etc.

This component provides a complete file upload experience with real-time feedback, making it easy for users to understand what's happening during the processing of their CSV files.
