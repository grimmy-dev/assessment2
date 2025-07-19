# ML Processor Documentation

## Overview

The `MLProcessor` class is an automated machine learning tool that trains Random Forest models on your data. It handles both classification and regression tasks, automatically processes categorical data, and makes predictions easy.

Think of it as your ML assistant that figures out what type of problem you have and builds a model for you.

## Key Features

- **Auto Model Selection**: Automatically chooses classification or regression
- **Smart Data Handling**: Processes text and numeric columns automatically
- **Easy Predictions**: Simple predict method with proper error handling
- **Model Persistence**: Save and load trained models
- **Type Safety**: Handles data type conversions for JSON compatibility

## Quick Start

```python
# Train a model
processor = MLProcessor()
result = processor.train_model("task_1", df, "target_column")

# Make predictions
prediction = processor.predict("task_1", {"feature1": "value1", "feature2": 42})

# Get model details
info = processor.get_model_info("task_1")
```

## Core Methods

### `train_model(task_id: str, df: pl.DataFrame, target_column: str)`

Trains a Random Forest model on your data.

**What it does:**

1. **Data Preparation**: Converts text to numbers, handles missing values
2. **Model Selection**: Picks classification or regression based on your target
3. **Training**: Splits data (80/20) and trains the model
4. **Evaluation**: Tests the model and returns accuracy/R² score

**Parameters:**

- `task_id`: Unique ID to identify this model
- `df`: Your data as a Polars DataFrame
- `target_column`: The column you want to predict

**Returns:**

```python
{
    "success": True,
    "model_type": "classification",  # or "regression"
    "score": 0.85,                   # accuracy or R² score
    "score_name": "Accuracy",        # or "R² Score"
    "feature_columns": ["age", "income", "category"],
    "n_samples": 1000,
    "n_features": 3
}
```

**Example:**

```python
# For classification (predicting categories)
result = processor.train_model("customer_type", df, "customer_segment")

# For regression (predicting numbers)
result = processor.train_model("price_model", df, "house_price")
```

### `predict(task_id: str, input_data: Dict[str, Any])`

Makes predictions using your trained model.

**Parameters:**

- `task_id`: ID of the model to use
- `input_data`: Dictionary with feature values

**Returns:**

```python
{
    "success": True,
    "prediction": "Premium",         # the actual prediction
    "prediction_proba": {            # confidence scores (classification only)
        "Premium": 0.7,
        "Standard": 0.2,
        "Basic": 0.1
    },
    "model_type": "classification"
}
```

**Example:**

```python
# Make a prediction
result = processor.predict("customer_type", {
    "age": 35,
    "income": 75000,
    "category": "tech"
})

print(result["prediction"])  # Output: "Premium"
```

### `get_model_info(task_id: str)`

Returns detailed information about a trained model.

**What you get:**

- Target column name
- Feature columns and their types
- Model type (classification/regression)
- Performance score
- Dataset size

### `save_model(task_id: str, filepath: str)` / `load_model(task_id: str, filepath: str)`

Save your trained models to disk or load them back.

```python
# Save a model
processor.save_model("customer_type", "models/customer_model.pkl")

# Load it later
processor.load_model("customer_type", "models/customer_model.pkl")
```

## How It Works

### Data Processing Pipeline

1. **Categorical Handling**: Text columns get converted to numbers using LabelEncoder
2. **Missing Values**: Null values become "missing" category or 0 for numbers
3. **Target Detection**: Automatically determines if it's a classification or regression problem

### Model Selection Logic

**Classification** (predicting categories):

- Target column contains text
- Target has less than 10 unique values
- Examples: "Yes/No", customer types, product categories

**Regression** (predicting numbers):

- Target column is numeric
- Target has many unique values
- Examples: prices, temperatures, sales amounts

### Smart Features

**Handles New Data**: When predicting, if the model sees a category it wasn't trained on, it gracefully handles it instead of crashing.

**Type Safety**: All outputs are converted to standard Python types, so they work perfectly with JSON APIs.

**Error Recovery**: If something goes wrong during encoding or prediction, the model tries to recover rather than fail completely.

## Common Use Cases

### Customer Segmentation

```python
# Train
result = processor.train_model("segments", customer_df, "segment")

# Predict new customer segment
prediction = processor.predict("segments", {
    "age": 28,
    "income": 45000,
    "purchases_last_year": 12
})
```

### Price Prediction

```python
# Train on house data
result = processor.train_model("house_prices", df, "price")

# Predict house price
prediction = processor.predict("house_prices", {
    "bedrooms": 3,
    "bathrooms": 2,
    "square_feet": 1500,
    "neighborhood": "downtown"
})
```

### Quality Control

```python
# Predict if product will pass quality check
result = processor.train_model("quality", df, "pass_fail")

# Check new product
prediction = processor.predict("quality", {
    "temperature": 75,
    "pressure": 14.7,
    "material": "steel"
})
```

## Error Handling

The processor handles common issues automatically:

- **Missing columns**: Tells you exactly which feature is missing
- **Unknown categories**: Uses default values for unseen categories
- **Data type mismatches**: Converts types as needed
- **Model not found**: Clear error message if you reference wrong task_id

## Performance Notes

- **Training Speed**: Random Forest is fast and works well on most datasets
- **Memory Usage**: Efficient with Polars DataFrames
- **Accuracy**: Generally good performance out-of-the-box, no tuning needed

The processor makes machine learning accessible - just point it at your data and target column, and it handles the rest automatically.
