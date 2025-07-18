## `MLProcessor` Class

This class is used to:

- Prepare data for training machine learning models.
- Train a Random Forest model (classification or regression).
- Make predictions.
- Save/load trained models.

It works with CSV data (via Polars DataFrames) and uses scikit-learn for modeling.

---

### `__init__(self)`

Initializes the `MLProcessor`.

- Creates empty dictionaries to store:

  - Trained models
  - Label encoders for categorical columns
  - Model info like score, type, and columns used
  - Feature column names used during training

---

### `prepare_data(self, df: pl.DataFrame, target_column: str)`

Prepares the data for training.

#### What it does:

- Separates input features and the target column.
- Converts categorical string columns to numbers using `LabelEncoder`.
- Converts the data to numpy arrays for compatibility with scikit-learn.

#### Parameters:

- `df`: The input data as a Polars DataFrame.
- `target_column`: The name of the column you want to predict.

#### Returns:

- `X_processed`: Features as a numpy array.
- `y_array`: Target values as a numpy array.
- `encoders`: Encoders used for feature columns.
- `target_encoder`: Encoder used for the target column (if it was categorical).

---

### `train_model(self, task_id: str, df: pl.DataFrame, target_column: str)`

Trains a Random Forest model using the data.

#### What it does:

- Prepares the data using `prepare_data()`.
- Automatically decides whether to use classification or regression.
- Splits data into training and testing sets.
- Trains the model and evaluates it (using accuracy or R² score).
- Stores the model and related metadata.

#### Parameters:

- `task_id`: A unique ID to keep track of the model.
- `df`: The input data.
- `target_column`: The column to predict.

#### Returns:

A dictionary with:

- Success flag
- Model type ("classification" or "regression")
- Score (Accuracy or R²)
- Feature and column info

---

### `predict(self, task_id: str, input_data: Dict[str, Any])`

Makes a prediction using a trained model.

#### What it does:

- Checks if a model exists for the given task ID.
- Converts input data to a Polars DataFrame.
- Encodes categorical fields if needed.
- Uses the trained model to predict the result.
- Decodes the result if the target was encoded.
- Also provides prediction probabilities (if classification).

#### Parameters:

- `task_id`: The task ID of the model to use.
- `input_data`: A dictionary of input features.

#### Returns:

A dictionary with:

- Prediction result
- Prediction probabilities (if applicable)
- Input used
- Model type
- Success flag or error

---

### `get_model_info(self, task_id: str)`

Returns information about a trained model.

#### Parameters:

- `task_id`: The model’s task ID.

#### Returns:

- A dictionary with model details like type, score, and columns used (or `None` if not found).

---

### `save_model(self, task_id: str, filepath: str)`

Saves the model to disk using `joblib`.

#### Parameters:

- `task_id`: The model's ID.
- `filepath`: Path to save the model file.

#### What it saves:

- The model
- Encoders
- Feature columns
- Model info

---

### `load_model(self, task_id: str, filepath: str)`

Loads a saved model from disk.

#### Parameters:

- `task_id`: ID to assign the loaded model.
- `filepath`: Path of the saved model file.

#### What it loads:

- The model
- Encoders
- Feature columns
- Model info
