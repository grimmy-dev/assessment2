# Home Page Component Documentation

## Overview

The Home page is the main application component that orchestrates the entire data analysis workflow. It manages global state and coordinates between all major components.

## What it does

- Manages the complete user workflow from file upload to predictions
- Coordinates state between all components
- Provides a single source of truth for task management
- Handles the application's main layout structure

## Global State Management

The component manages three key pieces of state:

### Task Management

- `currentTaskId`: Unique identifier for the uploaded dataset
- `canFetchDashboard`: Controls when components can load data
- `uploadStatus`: Tracks file upload progress ("idle", "uploading", "success", "error")

### State Handlers

- `handleTaskIdChange`: Updates the current task ID
- `handleCanFetchChange`: Controls data fetching permissions
- `handleUploadStatusChange`: Updates upload progress
- `handleReset`: Clears all state back to initial values

## Component Structure

The page renders components in workflow order:

1. **HeroSection** - Welcome message and introduction
2. **Uploader** - File upload interface with state management
3. **Predictor** - Machine learning prediction interface
4. **Footer** - Page footer

All components are wrapped in `MaxWidthWrapper` for consistent layout.

## Data Flow

The state flows through the application like this:

1. User uploads file in `Uploader`
2. `Uploader` updates `currentTaskId` and `uploadStatus`
3. When upload succeeds, `canFetchDashboard` becomes true
4. `Predictor` receives the task ID and permission to make predictions
5. `handleReset` can clear everything to start over

## Props Passed to Components

### Uploader Component

- `currentTaskId`: Current dataset identifier
- `canFetchDashboard`: Permission to fetch data
- `uploadStatus`: Current upload state
- `onTaskIdChange`: Function to update task ID
- `onCanFetchChange`: Function to update fetch permission
- `onUploadStatusChange`: Function to update upload status
- `onReset`: Function to reset all state

### Predictor Component

- `taskId`: Current dataset identifier
- `canFetch`: Permission to make predictions
- `uploadStatus`: Current upload state

## Key Features

- **Centralized State**: All important state is managed in one place
- **Optimized Updates**: Uses `useCallback` to prevent unnecessary re-renders
- **Clear Data Flow**: State changes flow predictably through the application
- **Reset Capability**: Can easily reset the entire application state

## Usage

This is a Next.js page component that automatically renders when users visit the home route:

```jsx
// Automatically rendered at "/"
export default function Home() {
  // Component logic here
}
```

## Dependencies

- React hooks (useState, useCallback)
- Next.js page structure
- Custom components (HeroSection, Uploader, Predictor, Footer)
- MaxWidthWrapper for layout
