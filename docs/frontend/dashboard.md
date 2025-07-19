# Dashboard Component Documentation

## Overview

The Dashboard component displays data analysis and insights for uploaded CSV files. It shows data quality metrics, column information, and interactive charts.

## What it does

- Shows dataset overview (rows, columns, memory usage)
- Displays data quality score (completeness percentage)
- Lists all columns with their data types and missing values
- Renders interactive charts and visualizations
- Handles loading states and error messages

## Props

- `taskId`: Unique identifier for the uploaded dataset
- `canFetch`: Boolean that controls when data can be loaded

## Main Features

### Data Overview Cards

Three summary cards showing:

1. **Dataset Dimensions** - Number of rows and columns
2. **Data Quality** - Completeness percentage (how much data is not missing)
3. **Memory Usage** - How much memory the dataset uses

### Column Information

A grid showing each column with:

- Column name
- Data type (text, number, etc.)
- Number of missing values
- Number of unique values

### Interactive Charts

Uses the `UniversalChart` component to create visualizations based on the data.

## Component States

### No File Uploaded

- Shows message to upload a CSV file
- Displays link to uploader section

### Loading

- Shows spinning loader
- Message: "Analyzing your data and generating insights..."

### Error

- Shows error message with warning icon
- Retry button to try loading again

### Success

- Displays all data overview cards
- Shows column information grid
- Renders interactive charts

## API Integration

- Fetches data from `/profile/{taskId}` endpoint
- Uses environment variable `NEXT_PUBLIC_API_URL` or defaults to localhost
- Automatically retries on error

## Dependencies

- React hooks (useState, useEffect)
- UI components (Button, Alert, Card, Badge)
- Lucide icons for visual elements
- Next.js Link for navigation
- Custom chart components (UniversalChart, ChartLoader)

## Usage

```jsx
<Dashboard taskId="abc123" canFetch={true} />
```

The component automatically loads and displays data when both `taskId` and `canFetch` are provided.
