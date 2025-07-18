# Predictor Component Documentation

## Overview

The `Predictor` component allows users to test machine learning predictions by entering custom inputs after uploading a CSV file. It sends the data to the backend and displays predictions.

### Props

- **taskId**: The task ID returned after uploading a CSV file.
- **canFetch**: Boolean flag indicating whether the prediction system is ready.
- **uploadStatus**: Current upload status (`idle`, `uploading`, `success`, `error`).

---

## Functions

### `handlePredict`

Sends user input data to the backend (`/predict` endpoint) using the provided task ID. On success or error, it updates the list of prediction results.

### `handleTrain`

Stores the selected target column and resets previous predictions.

---

## Behavior

- If `taskId` is not available or upload is still processing, a message is shown instead of the prediction interface.
- Once the model is ready, it renders:

  - **InputTable**: For entering test data.
  - **OutputDisplayer**: For showing prediction results.

- A link is provided to allow users to upload a new file.

---

## Dependencies

- `InputTable`: Component for entering test data and submitting predictions.
- `OutputDisplayer`: Shows prediction output and related details.
- `Button`, `Link`: UI elements for navigation.
