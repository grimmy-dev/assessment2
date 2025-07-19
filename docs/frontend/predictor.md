# Predictor Component Documentation

## Overview

The Predictor component allows users to test machine learning predictions using their uploaded data. It provides input forms and displays prediction results in real-time.

## What it does

- Creates input forms for making predictions
- Sends prediction requests to the API
- Displays prediction results and confidence scores
- Manages model training with target column selection
- Shows different states based on upload progress

## Props

- `taskId`: Unique identifier for the uploaded dataset
- `canFetch`: Boolean that controls when predictions can be made
- `uploadStatus`: Current status of file upload ("idle", "uploading", "success", "error")

## Main Features

### Input Interface

- Uses `InputTable` component for user input
- Allows selection of target column for training
- Handles form submission for predictions

### Output Display

- Uses `OutputDisplayer` component to show results
- Shows prediction values and confidence scores
- Displays error messages if prediction fails
- Maintains history of all predictions made

### State Management

- Tracks all prediction results in an array
- Stores the selected target column
- Clears predictions when retraining model

## Component States

### Not Ready

Shows when conditions aren't met:

- No file uploaded ("Please upload a CSV file first")
- File uploading ("Processing your data...")
- Upload failed ("Upload failed. Please try again.")
- Data not ready ("Preparing prediction interface...")

### Ready for Predictions

- Shows input form and output display
- Displays current task ID
- Provides "Upload again" link

## API Integration

- Makes POST requests to `/predict` endpoint
- Sends task ID and input data in request body
- Handles both successful predictions and errors
- Uses environment variable `NEXT_PUBLIC_API_URL` or defaults to localhost

## Prediction Result Format

Each prediction result includes:

- `success`: Whether prediction succeeded
- `prediction`: The predicted value
- `prediction_proba`: Confidence scores (optional)
- `input_data`: The input values used
- `model_type`: Type of ML model used
- `error`: Error message if prediction failed

## Error Handling

- Network errors show "Network error" message
- API errors display the server's error message
- Failed predictions are still stored and displayed
- Errors don't stop future predictions

## Dependencies

- React hooks (useState)
- UI components (Button)
- Next.js Link for navigation
- Custom components (InputTable, OutputDisplayer)

## Usage

```jsx
<Predictor taskId="abc123" canFetch={true} uploadStatus="success" />
```

The component only renders the prediction interface when all conditions are met (file uploaded successfully and data is ready).
