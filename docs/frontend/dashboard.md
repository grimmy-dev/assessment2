# Dashboard Component Documentation

## Overview

The `Dashboard` component is responsible for displaying the data analysis results after a CSV file is uploaded and processed by the backend. It fetches profiling information and renders summary cards, column analysis, and visual charts.

### Props

- **taskId**: The unique task ID returned after CSV upload.
- **canFetch**: Boolean flag indicating if data is ready to be fetched and displayed.

## Functions

### `fetchDashboardData`

Fetches the profiling results for the uploaded CSV file using the `/profile/{task_id}` endpoint and updates the component state accordingly.

### `renderDataOverview`

Renders the top-level summary cards:

- Dataset Dimensions (Rows x Columns)
- Data Quality Completeness Score
- Memory Usage

### `renderColumnInfo`

Displays detailed stats per column, including:

- Column name and type
- Missing values count
- Unique values count

### `renderContent`

Handles conditional rendering based on state:

- Shows instruction if no file is uploaded
- Shows loader when data is being analyzed
- Displays error and retry button if fetching fails
- Renders the data overview, column stats, and chart builder on success

## Behavior

- On mount and whenever `taskId` or `canFetch` changes, the component triggers `fetchDashboardData` to retrieve data from the backend.
- The dashboard gracefully handles error and loading states and guides the user through the experience.

## Dependencies

- `UniversalChart`: Renders visualizations using columns from the dataset.
- `ChartLoader`: Displays loading UI and fallback messages.
