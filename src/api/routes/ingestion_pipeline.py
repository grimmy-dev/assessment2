# data processing (mainly csv)
# -- data chunking
# -- data selection using llm
# -- data cleaning of selected columns
# -- test and train split
# -- invoke ml pipeline (train)
# data profiling (use ful for logs to show on frontend)
# -- no of rows and columns
# -- columns and types
# -- Outliers
# -- Skewness
# -- Pairwise correlations
# -- Imbalanced columns

import io
import asyncio
import json
from typing import Dict, List
import polars as pl
from pydantic import BaseModel

from ..connection_manager import ConnectionManager


class ProcessingResult(BaseModel):
    task_id: str
    success: bool
    original_rows: int
    cleaned_rows: int
    columns: List[str]
    target_columns: List[str]
    summary: str


class CSVProcessor:
    def __init__(self, connection_manager: ConnectionManager):
        self.manager = connection_manager
        self.processed_data: Dict[str, pl.DataFrame] = {}
        self.processing_results: Dict[str, ProcessingResult] = {}
        self.active_tasks: Dict[str, asyncio.Task] = {}

    async def process_csv(self, file_content: bytes, task_id: str) -> ProcessingResult:
        """Process CSV with comprehensive error handling and progress logging"""
        try:
            await self.manager.send_log(
                task_id, "info", "Starting CSV processing...", 5
            )

            # Add small delay to ensure WebSocket connection is established
            await asyncio.sleep(1)

            await self.manager.send_log(task_id, "info", "Reading CSV file...", 10)

            # Read CSV with error handling
            try:
                df = pl.read_csv(io.BytesIO(file_content))
            except Exception as e:
                await self.manager.send_log(
                    task_id, "error", f"Failed to read CSV: {str(e)}", 0
                )
                raise

            original_rows = len(df)
            await self.manager.send_log(
                task_id,
                "info",
                f"Loaded {original_rows} rows, {len(df.columns)} columns",
                20,
            )

            # Validate data
            if original_rows == 0:
                await self.manager.send_log(task_id, "error", "CSV file is empty", 0)
                raise ValueError("CSV file is empty")

            if len(df.columns) == 0:
                await self.manager.send_log(task_id, "error", "CSV has no columns", 0)
                raise ValueError("CSV has no columns")

            # Simple cleaning steps
            await self.manager.send_log(
                task_id, "info", "Analyzing data structure...", 30
            )
            await asyncio.sleep(1)  # Small delay for better UX

            # Remove completely empty columns
            await self.manager.send_log(
                task_id, "info", "Removing empty columns...", 40
            )
            empty_cols = [col for col in df.columns if df[col].null_count() == len(df)]
            if empty_cols:
                df = df.drop(empty_cols)
                await self.manager.send_log(
                    task_id, "info", f"Removed {len(empty_cols)} empty columns", 45
                )
            await asyncio.sleep(1)

            # Remove duplicate rows
            await self.manager.send_log(
                task_id, "info", "Removing duplicate rows...", 50
            )
            original_len = len(df)
            df = df.unique()
            duplicates = original_len - len(df)
            if duplicates > 0:
                await self.manager.send_log(
                    task_id, "info", f"Removed {duplicates} duplicate rows", 60
                )
            await asyncio.sleep(1)

            # Fill missing values
            await self.manager.send_log(
                task_id, "info", "Handling missing values...", 70
            )
            for col in df.columns:
                null_count = df[col].null_count()
                if null_count > 0:
                    if df[col].dtype in [pl.Int64, pl.Float64]:
                        median_val = df[col].median()
                        df = df.with_columns(df[col].fill_null(median_val))
                    else:
                        df = df.with_columns(df[col].fill_null("Unknown"))
            await asyncio.sleep(1)

            await self.manager.send_log(task_id, "info", "Filled missing values", 75)

            # Identify potential target columns
            await self.manager.send_log(
                task_id, "info", "Identifying target columns...", 80
            )
            target_columns = []
            for col in df.columns:
                try:
                    unique_count = df[col].n_unique()
                    if unique_count < 20 and unique_count > 1:
                        target_columns.append(col)
                except Exception:
                    # Skip columns that can't be analyzed
                    continue

            await self.manager.send_log(
                task_id,
                "info",
                f"Found {len(target_columns)} potential target columns",
                85,
            )

            # Store results
            self.processed_data[task_id] = df
            result = ProcessingResult(
                task_id=task_id,
                success=True,
                original_rows=original_rows,
                cleaned_rows=len(df),
                columns=df.columns,
                target_columns=target_columns,
                summary=f"Processed [{original_rows}x{len(df.columns)}] > {len(df)} rows, {len(df.columns)} columns",
            )
            self.processing_results[task_id] = result

            await self.manager.send_log(
                task_id,
                "success",
                "Processing completed successfully!",
                90,
            )

            await self.manager.send_log(
                task_id,
                "success",
                json.dumps(result.target_columns),
                95,
            )
            await self.manager.send_log(
                task_id,
                "success",
                result.summary,
                100,
                finished=True,
            )
            return result

        except Exception as e:
            error_msg = f"Processing failed: {str(e)}"
            await self.manager.send_log(task_id, "error", error_msg, 0, finished=True)

            # Store error result
            result = ProcessingResult(
                task_id=task_id,
                success=False,
                original_rows=0,
                cleaned_rows=0,
                columns=[],
                target_columns=[],
                summary=error_msg,
            )
            self.processing_results[task_id] = result
            raise

    async def start_processing(self, file_content: bytes, task_id: str):
        """Start processing in background and track the task"""
        task = asyncio.create_task(self.process_csv(file_content, task_id))
        self.active_tasks[task_id] = task

        # Clean up task when done
        def cleanup(task):
            if task_id in self.active_tasks:
                del self.active_tasks[task_id]

        task.add_done_callback(cleanup)
        return task

    def get_result(self, task_id: str) -> ProcessingResult:
        """Get processing result"""
        return self.processing_results.get(task_id)

    def get_processed_data(self, task_id: str) -> pl.DataFrame:
        """Get processed DataFrame"""
        return self.processed_data.get(task_id)

    def cancel_task(self, task_id: str):
        """Cancel a running task"""
        if task_id in self.active_tasks:
            self.active_tasks[task_id].cancel()
            del self.active_tasks[task_id]

    def get_active_tasks(self) -> List[str]:
        """Get list of active task IDs"""
        return list(self.active_tasks.keys())
