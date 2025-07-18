import polars as pl
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, r2_score
import joblib
import os
from typing import Dict, Any, Optional, Tuple
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class MLProcessor:
    def __init__(self):
        self.models = {}
        self.label_encoders = {}
        self.model_info = {}
        self.feature_columns = {}

    def prepare_data(
        self, df: pl.DataFrame, target_column: str
    ) -> Tuple[np.ndarray, np.ndarray, Dict, Optional[LabelEncoder]]:
        """Prepare data for training by handling categorical variables"""
        # Separate features and target
        X = df.drop(target_column)
        y = df[target_column]

        # Convert to numpy arrays for sklearn
        X_processed = X.to_numpy()
        y_array = y.to_numpy()

        # Handle categorical variables in features
        encoders = {}
        feature_columns = X.columns

        # Process categorical columns
        for i, column in enumerate(feature_columns):
            if df[column].dtype == pl.Utf8:  # String/categorical column
                le = LabelEncoder()
                # Handle null values by converting to string
                col_data = df[column].fill_null("missing").to_numpy().astype(str)
                X_processed[:, i] = le.fit_transform(col_data)
                encoders[column] = le

        # Handle target variable if it's categorical
        target_encoder = None
        if df[target_column].dtype == pl.Utf8:
            target_encoder = LabelEncoder()
            # Handle null values in target
            y_data = df[target_column].fill_null("missing").to_numpy().astype(str)
            y_array = target_encoder.fit_transform(y_data)

        return X_processed, y_array, encoders, target_encoder

    def train_model(
        self, task_id: str, df: pl.DataFrame, target_column: str
    ) -> Dict[str, Any]:
        """Train a Random Forest model"""
        try:
            if target_column not in df.columns:
                raise ValueError(f"Target column '{target_column}' not found in data")

            # Prepare data
            X, y, feature_encoders, target_encoder = self.prepare_data(
                df, target_column
            )

            # Determine if it's classification or regression
            unique_values = np.unique(y)
            is_classification = (
                df[target_column].dtype == pl.Utf8
                or len(unique_values) < 10
                or target_encoder is not None
            )

            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X,
                y,
                test_size=0.2,
                random_state=42,
                stratify=y if is_classification else None,
            )

            # Train model
            if is_classification:
                model = RandomForestClassifier(n_estimators=100, random_state=42)
                model.fit(X_train, y_train)
                y_pred = model.predict(X_test)
                score = accuracy_score(y_test, y_pred)
                score_name = "Accuracy"
            else:
                model = RandomForestRegressor(n_estimators=100, random_state=42)
                model.fit(X_train, y_train)
                y_pred = model.predict(X_test)
                score = r2_score(y_test, y_pred)
                score_name = "R² Score"

            # Store model and encoders
            self.models[task_id] = model
            self.label_encoders[task_id] = {
                "features": feature_encoders,
                "target": target_encoder,
            }
            self.feature_columns[task_id] = list(df.drop(target_column).columns)

            # Store model info
            self.model_info[task_id] = {
                "target_column": target_column,
                "feature_columns": list(df.drop(target_column).columns),
                "feature_types": {
                    col: str(df[col].dtype) for col in df.drop(target_column).columns
                },
                "model_type": "classification" if is_classification else "regression",
                "score": score,
                "score_name": score_name,
                "n_samples": len(df),
                "n_features": len(df.drop(target_column).columns),
            }

            logger.info(f"Model trained for task {task_id}: {score_name} = {score:.4f}")

            return {
                "success": True,
                "model_type": "classification" if is_classification else "regression",
                "score": float(score),  # Ensure score is a native Python float
                "score_name": score_name,
                "feature_columns": list(df.drop(target_column).columns),
                "feature_types": {
                    col: str(df[col].dtype) for col in df.drop(target_column).columns
                },
                "n_samples": int(len(df)),  # Ensure it's a native Python int
                "n_features": int(
                    len(df.drop(target_column).columns)
                ),  # Ensure it's a native Python int
            }

        except Exception as e:
            logger.error(f"Error training model for task {task_id}: {str(e)}")
            return {"success": False, "error": str(e)}

    def predict(self, task_id: str, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Make predictions using the trained model"""
        try:
            if task_id not in self.models:
                raise ValueError(f"No model found for task {task_id}")

            model = self.models[task_id]
            feature_encoders = self.label_encoders[task_id]["features"]
            target_encoder = self.label_encoders[task_id]["target"]
            expected_columns = self.feature_columns[task_id]

            # Prepare input data as Polars DataFrame
            input_df = pl.DataFrame([input_data])

            # Ensure all expected columns are present
            for col in expected_columns:
                if col not in input_df.columns:
                    raise ValueError(f"Missing required feature: {col}")

            # Reorder columns to match training data
            input_df = input_df.select(expected_columns)

            # Convert to numpy for processing
            input_array = input_df.to_numpy()

            # Apply feature encoders
            for i, column in enumerate(expected_columns):
                if column in feature_encoders:
                    encoder = feature_encoders[column]
                    try:
                        # Convert to string and handle unseen categories
                        value = str(input_array[0, i])
                        if value in encoder.classes_:
                            input_array[0, i] = encoder.transform([value])[0]
                        else:
                            # Handle unseen categories by using the most frequent class
                            input_array[0, i] = 0  # Default to first category
                    except Exception as e:
                        logger.warning(f"Error encoding column {column}: {e}")
                        input_array[0, i] = 0

            # Make prediction
            prediction_raw = model.predict(input_array.reshape(1, -1))[0]

            # Get prediction probabilities for classification
            prediction_proba = None
            if hasattr(model, "predict_proba"):
                proba = model.predict_proba(input_array.reshape(1, -1))[0]
                if target_encoder:
                    # Map probabilities to class names
                    class_names = target_encoder.classes_
                    prediction_proba = {
                        str(class_names[i]): float(prob) for i, prob in enumerate(proba)
                    }
                else:
                    prediction_proba = {
                        f"Class_{i}": float(prob) for i, prob in enumerate(proba)
                    }

            # Decode target if it was encoded
            if target_encoder:
                try:
                    prediction = target_encoder.inverse_transform(
                        [int(prediction_raw)]
                    )[0]
                    # Convert to native Python type
                    prediction = (
                        str(prediction)
                        if isinstance(prediction, (np.str_, np.unicode_))
                        else prediction
                    )
                except Exception as e:
                    logger.warning(f"Error decoding prediction: {e}")
                    prediction = prediction_raw
            else:
                prediction = prediction_raw

            # Convert numpy types to native Python types for JSON serialization
            if isinstance(prediction, (np.integer, np.int64, np.int32)):
                prediction = int(prediction)
            elif isinstance(prediction, (np.floating, np.float64, np.float32)):
                prediction = float(prediction)
            elif isinstance(prediction, (np.str_, np.unicode_)):
                prediction = str(prediction)
            elif isinstance(prediction, np.ndarray):
                prediction = prediction.tolist()

            return {
                "success": True,
                "prediction": prediction,
                "prediction_proba": prediction_proba,
                "input_data": input_data,
                "model_type": self.model_info[task_id]["model_type"],
            }

        except Exception as e:
            logger.error(f"Error making prediction for task {task_id}: {str(e)}")
            return {"success": False, "error": str(e)}

    def get_model_info(self, task_id: str) -> Optional[Dict[str, Any]]:
        """Get model information"""
        return self.model_info.get(task_id)

    def save_model(self, task_id: str, filepath: str):
        """Save model to disk"""
        if task_id in self.models:
            model_data = {
                "model": self.models[task_id],
                "encoders": self.label_encoders[task_id],
                "feature_columns": self.feature_columns[task_id],
                "model_info": self.model_info[task_id],
            }
            joblib.dump(model_data, filepath)

    def load_model(self, task_id: str, filepath: str):
        """Load model from disk"""
        if os.path.exists(filepath):
            model_data = joblib.load(filepath)
            self.models[task_id] = model_data["model"]
            self.label_encoders[task_id] = model_data["encoders"]
            self.feature_columns[task_id] = model_data["feature_columns"]
            self.model_info[task_id] = model_data["model_info"]
