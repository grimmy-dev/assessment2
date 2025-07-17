import polars as pl
from typing import Dict, List, Any
from datetime import datetime

from ..utils import setup_logger


class DataProfiler:
    """Simple data profiler for CSV analysis"""

    def __init__(self, df: pl.DataFrame):
        self.df = df
        self.profile_data = {}
        self.logger = setup_logger(__name__)

    def generate_profile(self) -> Dict[str, Any]:
        """Generate comprehensive data profile"""

        try:

            # Basic info
            basic_info = {
                "shape": {"rows": self.df.shape[0], "columns": self.df.shape[1]},
                "columns": self.df.columns,
                "memory_usage": self._estimate_memory_usage(),
                "generated_at": datetime.now().isoformat(),
            }

            # Column analysis
            column_analysis = {}
            for col in self.df.columns:
                column_analysis[col] = self._analyze_column(col)

            missing_values = {
                col: int(self.df[col].null_count()) for col in self.df.columns
            }

            # Data quality
            data_quality = self._analyze_data_quality()

            # Correlations (for numeric columns only)
            correlations = self._calculate_correlations()

            # Sample data
            sample_data = self.df.head(10).to_dicts()

            self.profile_data = {
                "basic_info": basic_info,
                "column_analysis": column_analysis,
                "missing_values": missing_values,
                "data_quality": data_quality,
                "correlations": correlations,
                "sample_data": sample_data,
            }

            return self.profile_data
        except Exception as e:
            self.logger.error("failed to profile the data", e)
            raise

    def _analyze_column(self, col: str) -> Dict[str, Any]:
        """Analyze individual column"""
        series = self.df[col]

        analysis = {
            "name": col,
            "dtype": str(series.dtype),
            "null_count": series.null_count(),
            "null_percentage": (series.null_count() / len(series)) * 100,
            "unique_count": series.n_unique(),
            "unique_percentage": (series.n_unique() / len(series)) * 100,
        }

        # Type-specific analysis
        if series.dtype in [pl.Int64, pl.Float64, pl.Int32, pl.Float32]:
            analysis.update(self._analyze_numeric_column(series))
        elif series.dtype == pl.Utf8:
            analysis.update(self._analyze_text_column(series))
        elif series.dtype in [pl.Date, pl.Datetime]:
            analysis.update(self._analyze_date_column(series))

        return analysis

    def _analyze_numeric_column(self, series: pl.Series) -> Dict[str, Any]:
        """Analyze numeric column"""
        try:
            stats = series.describe()
            return {
                "type": "numeric",
                "min": float(series.min()) if series.min() is not None else None,
                "max": float(series.max()) if series.max() is not None else None,
                "mean": float(series.mean()) if series.mean() is not None else None,
                "median": (
                    float(series.median()) if series.median() is not None else None
                ),
                "std": float(series.std()) if series.std() is not None else None,
                "zeros_count": (series == 0).sum(),
                "negative_count": (series < 0).sum(),
                "positive_count": (series > 0).sum(),
            }
        except:
            return {"type": "numeric", "error": "Could not analyze numeric column"}

    def _analyze_text_column(self, series: pl.Series) -> Dict[str, Any]:
        """Analyze text column"""
        try:
            non_null_series = series.drop_nulls()

            # Get value counts (top 10)
            value_counts = {}
            try:
                vc = non_null_series.value_counts(sort=True).head(10)
                value_counts = {str(row[0]): int(row[1]) for row in vc.to_dicts()}
            except:
                value_counts = {}

            # Calculate lengths
            lengths = non_null_series.str.len_chars()

            return {
                "type": "text",
                "avg_length": (
                    float(lengths.mean()) if lengths.mean() is not None else 0
                ),
                "min_length": int(lengths.min()) if lengths.min() is not None else 0,
                "max_length": int(lengths.max()) if lengths.max() is not None else 0,
                "empty_strings": (non_null_series == "").sum(),
                "value_counts": value_counts,
            }
        except:
            return {"type": "text", "error": "Could not analyze text column"}

    def _analyze_date_column(self, series: pl.Series) -> Dict[str, Any]:
        """Analyze date column"""
        try:
            non_null_series = series.drop_nulls()
            return {
                "type": "datetime",
                "min_date": (
                    str(non_null_series.min())
                    if non_null_series.min() is not None
                    else None
                ),
                "max_date": (
                    str(non_null_series.max())
                    if non_null_series.max() is not None
                    else None
                ),
                "date_range_days": (
                    (non_null_series.max() - non_null_series.min()).days
                    if non_null_series.max() and non_null_series.min()
                    else 0
                ),
            }
        except:
            return {"type": "datetime", "error": "Could not analyze date column"}

    def _analyze_data_quality(self) -> Dict[str, Any]:
        """Analyze overall data quality"""
        total_cells = self.df.shape[0] * self.df.shape[1]
        total_nulls = sum(self.df[col].null_count() for col in self.df.columns)

        # Find duplicate rows
        duplicate_rows = self.df.shape[0] - self.df.n_unique()

        return {
            "total_cells": total_cells,
            "total_nulls": total_nulls,
            "null_percentage": (
                (total_nulls / total_cells) * 100 if total_cells > 0 else 0
            ),
            "duplicate_rows": duplicate_rows,
            "duplicate_percentage": (
                (duplicate_rows / self.df.shape[0]) * 100 if self.df.shape[0] > 0 else 0
            ),
            "completeness_score": (
                ((total_cells - total_nulls) / total_cells) * 100
                if total_cells > 0
                else 0
            ),
        }

    def _calculate_correlations(self) -> Dict[str, Any]:
        """Calculate correlations between numeric columns"""
        numeric_cols = [
            col
            for col in self.df.columns
            if self.df[col].dtype in [pl.Int64, pl.Float64, pl.Int32, pl.Float32]
        ]

        if len(numeric_cols) < 2:
            return {"message": "Not enough numeric columns for correlation analysis"}

        try:
            # Select only numeric columns and calculate correlation
            numeric_df = self.df.select(numeric_cols)

            # Convert to correlation matrix manually
            correlations = {}
            for col1 in numeric_cols:
                correlations[col1] = {}
                for col2 in numeric_cols:
                    if col1 == col2:
                        correlations[col1][col2] = 1.0
                    else:
                        try:
                            # Calculate Pearson correlation
                            corr = numeric_df[col1].corr(numeric_df[col2])
                            correlations[col1][col2] = (
                                float(corr) if corr is not None else 0.0
                            )
                        except:
                            correlations[col1][col2] = 0.0

            return correlations
        except Exception as e:
            return {"error": f"Could not calculate correlations: {str(e)}"}

    def _estimate_memory_usage(self) -> Dict[str, Any]:
        """Estimate memory usage"""
        try:
            # This is a rough estimate
            total_bytes = 0
            for col in self.df.columns:
                series = self.df[col]
                if series.dtype in [pl.Int64, pl.Float64]:
                    total_bytes += len(series) * 8
                elif series.dtype in [pl.Int32, pl.Float32]:
                    total_bytes += len(series) * 4
                elif series.dtype == pl.Utf8:
                    # Estimate string memory usage
                    avg_length = series.str.len_chars().mean() or 0
                    total_bytes += len(series) * avg_length
                else:
                    total_bytes += len(series) * 8  # Default estimate

            return {
                "total_bytes": total_bytes,
                "total_mb": round(total_bytes / (1024 * 1024), 2),
                "per_row_bytes": (
                    round(total_bytes / self.df.shape[0], 2)
                    if self.df.shape[0] > 0
                    else 0
                ),
            }
        except:
            return {"error": "Could not estimate memory usage"}

    def get_column_suggestions(self) -> Dict[str, List[str]]:
        """Get column suggestions for different chart types"""
        numeric_cols = [
            col
            for col in self.df.columns
            if self.df[col].dtype in [pl.Int64, pl.Float64, pl.Int32, pl.Float32]
        ]

        categorical_cols = [
            col
            for col in self.df.columns
            if self.df[col].dtype == pl.Utf8 and self.df[col].n_unique() < 50
        ]

        date_cols = [
            col
            for col in self.df.columns
            if self.df[col].dtype in [pl.Date, pl.Datetime]
        ]

        return {
            "numeric": numeric_cols,
            "categorical": categorical_cols,
            "date": date_cols,
            "all": self.df.columns,
        }
