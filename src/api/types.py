from typing import Any, Dict, List, Optional
from pydantic import BaseModel


# connection manager
class LogMessage(BaseModel):
    timestamp: str
    level: str  # "info", "success", "error"
    message: str
    progress: int = 0
    finished: Optional[bool] = None  # Add this field


# ingestion
class ProcessingResult(BaseModel):
    task_id: str
    success: bool
    original_rows: int
    cleaned_rows: int
    columns: List[str]
    target_columns: List[str]
    summary: str


# ml
class TrainModelRequest(BaseModel):
    task_id: str
    target_column: str


class PredictionRequest(BaseModel):
    task_id: str
    input_data: Dict[str, Any]


class TrainModelResponse(BaseModel):
    success: bool
    model_type: Optional[str] = None
    score: Optional[float] = None
    score_name: Optional[str] = None
    feature_columns: Optional[List[str]] = None
    feature_types: Optional[Dict[str, str]] = None
    n_samples: Optional[int] = None
    n_features: Optional[int] = None
    error: Optional[str] = None


class PredictionResponse(BaseModel):
    success: bool
    prediction: Optional[Any] = None
    prediction_proba: Optional[Dict[str, float]] = None
    input_data: Optional[Dict[str, Any]] = None
    model_type: Optional[str] = None
    error: Optional[str] = None
