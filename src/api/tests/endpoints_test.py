import pytest
from unittest.mock import Mock, patch, AsyncMock
from fastapi.testclient import TestClient
import io
import polars as pl

# Import your app (adjust the import path as needed)
from src.api.main import app  # Replace with actual import path

@pytest.fixture
def client():
    """Test client fixture"""
    return TestClient(app)


class TestBasicEndpoints:
    def test_root_endpoint(self, client):
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "CSV Data Profiler API"
        assert data["version"] == "1.0.0"

    def test_health_endpoint(self, client):
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert "timestamp" in data
        assert "active_tasks" in data

    def test_debug_endpoint(self, client):
        task_id = "test-task-123"
        response = client.get(f"/debug/{task_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["task_id"] == task_id
        assert "has_processed_data" in data
        assert "active_tasks" in data


class TestFileUpload:
    def test_upload_valid_csv(self, client):
        csv_content = "name,age,city\nJohn,25,NYC\nJane,30,LA"
        csv_file = io.BytesIO(csv_content.encode())

        with patch("src.api.main.csv_processor.start_processing") as mock_process:
            mock_process.return_value = AsyncMock()
            response = client.post("/upload", files={"file": ("test.csv", csv_file, "text/csv")})

            assert response.status_code == 200
            data = response.json()
            assert "task_id" in data
            assert data["message"] == "Processing started"
            assert data["filename"] == "test.csv"

    def test_upload_non_csv_file(self, client):
        txt_content = "This is not a CSV file"
        txt_file = io.BytesIO(txt_content.encode())

        response = client.post("/upload", files={"file": ("test.txt", txt_file, "text/plain")})
        assert response.status_code == 400
        assert "Only CSV files are supported" in response.json()["detail"]

    def test_upload_empty_file(self, client):
        empty_file = io.BytesIO(b"")
        response = client.post("/upload", files={"file": ("empty.csv", empty_file, "text/csv")})
        assert response.status_code == 400
        assert "File is empty" in response.json()["detail"]

    def test_upload_large_file(self, client):
        large_content = "a" * (51 * 1024 * 1024)  # 51MB
        large_file = io.BytesIO(large_content.encode())
        response = client.post("/upload", files={"file": ("large.csv", large_file, "text/csv")})
        assert response.status_code == 400
        assert "File too large" in response.json()["detail"]


class TestDataEndpoints:
    @patch("src.api.main.csv_processor.get_processed_data")
    def test_get_processed_data_info_success(self, mock_get_data, client):
        mock_df = pl.DataFrame({"name": ["John", "Jane"], "age": [25, 30], "city": ["NYC", "LA"]})
        mock_get_data.return_value = mock_df

        mock_result = Mock()
        mock_result.success = True
        mock_result.summary = "Processing completed"
        mock_result.target_columns = ["age"]

        with patch.dict("src.api.main.csv_processor.processing_results", {"test-task": mock_result}):
            response = client.get("/processed-data/test-task")
            assert response.status_code == 200
            data = response.json()
            assert "columns" in data
            assert "shape" in data
            assert data["columns"] == ["name", "age", "city"]

    @patch("src.api.main.csv_processor.get_processed_data")
    def test_get_processed_data_info_not_found(self, mock_get_data, client):
        mock_get_data.return_value = None
        response = client.get("/processed-data/nonexistent-task")
        assert response.status_code == 404

    @patch("src.api.main.csv_processor.get_processed_data")
    def test_cancel_task_not_found(self, mock_get_data, client):
        with patch("src.api.main.csv_processor.get_active_tasks", return_value={}):
            response = client.delete("/cancel/nonexistent-task")
            assert response.status_code == 404

    @patch("src.api.main.csv_processor.get_active_tasks")
    @patch("src.api.main.csv_processor.cancel_task")
    def test_cancel_task_success(self, mock_cancel, mock_get_tasks, client):
        mock_get_tasks.return_value = {"test-task": Mock()}
        response = client.delete("/cancel/test-task")
        assert response.status_code == 200
        assert "cancelled" in response.json()["message"]
        mock_cancel.assert_called_once_with("test-task")


class TestChartDataEndpoint:
    @patch("src.api.main.csv_processor.get_processed_data")
    def test_get_chart_data_scatter(self, mock_get_data, client):
        mock_df = pl.DataFrame({"x_col": [1, 2, 3], "y_col": [10, 20, 30]})
        mock_get_data.return_value = mock_df

        response = client.get("/chart-data/test-task?x_axis=x_col&y_axis=y_col&chart_type=scatter")
        assert response.status_code == 200
        data = response.json()
        assert data["chart_type"] == "scatter"
        assert len(data["data"]) == 3
        assert data["data"][0] == {"x": 1, "y": 10}

    @patch("src.api.main.csv_processor.get_processed_data")
    def test_get_chart_data_invalid_column(self, mock_get_data, client):
        mock_df = pl.DataFrame({"valid_col": [1, 2, 3]})
        mock_get_data.return_value = mock_df

        response = client.get("/chart-data/test-task?x_axis=invalid_col")
        assert response.status_code == 400
        assert "not found" in response.json()["detail"]

    @patch("src.api.main.csv_processor.get_processed_data")
    def test_get_chart_data_no_task(self, mock_get_data, client):
        mock_get_data.return_value = None
        response = client.get("/chart-data/nonexistent?x_axis=col")
        assert response.status_code == 404


class TestProfileEndpoint:
    @patch("src.api.main.csv_processor.get_processed_data")
    @patch("src.api.main.DataProfiler")
    def test_get_data_profile_success(self, mock_profiler_class, mock_get_data, client):
        mock_df = pl.DataFrame({"col1": [1, 2, 3]})
        mock_get_data.return_value = mock_df

        mock_profiler = Mock()
        mock_profile = {"columns": 1, "rows": 3}
        mock_profiler.generate_profile.return_value = mock_profile
        mock_profiler_class.return_value = mock_profiler

        response = client.get("/profile/test-task")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "profile" in data

    @patch("src.api.main.csv_processor.get_processed_data")
    def test_get_data_profile_no_data(self, mock_get_data, client):
        mock_get_data.return_value = None
        response = client.get("/profile/nonexistent-task")
        assert response.status_code == 404


class TestMLEndpoints:
    @patch("src.api.main.csv_processor.get_processed_data")
    @patch("src.api.main.ml_processor.train_model")
    def test_train_model_success(self, mock_train, mock_get_data, client):
        mock_df = pl.DataFrame({"feature": [1, 2, 3], "target": [10, 20, 30]})
        mock_get_data.return_value = mock_df

        mock_train.return_value = {
            "success": True,
            "model_id": "test-model",
            "metrics": {"accuracy": 0.95},
        }

        response = client.post("/train", json={"task_id": "test-task", "target_column": "target"})
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

    @patch("src.api.main.ml_processor.predict")
    def test_predict_success(self, mock_predict, client):
        mock_predict.return_value = {"success": True, "predictions": [25.5]}

        response = client.post("/predict", json={"task_id": "test-task", "input_data": {"feature": 2.5}})
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

    @patch("src.api.main.ml_processor.get_model_info")
    def test_get_model_info_success(self, mock_get_info, client):
        mock_get_info.return_value = {
            "model_type": "regression",
            "features": ["feature1", "feature2"],
        }

        response = client.get("/model-info/test-task")
        assert response.status_code == 200

    @patch("src.api.main.ml_processor.get_model_info")
    def test_get_model_info_not_found(self, mock_get_info, client):
        mock_get_info.return_value = None
        response = client.get("/model-info/nonexistent")
        assert response.status_code == 404


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
