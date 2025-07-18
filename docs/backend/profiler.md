## `DataProfiler` Class

A simple tool to analyze CSV data and generate a summary report.
It gives you stats like data shape, missing values, column insights, correlations, and sample rows.

---

### `__init__(self, df: pl.DataFrame)`

Creates a new profiler using the given DataFrame.

- **df**: The CSV data as a Polars DataFrame.
- Sets up logging and an empty profile dictionary.

---

### `generate_profile(self) -> Dict[str, Any]`

Creates a full profile report of the dataset.

#### What it includes:

- Basic info: row/column count, memory use, column names
- Column-wise statistics (type, nulls, unique values, etc.)
- Missing values per column
- Overall data quality (null % and duplicate rows)
- Correlation matrix for numeric columns
- Sample (first 10) rows

#### Returns:

- A dictionary with the full profile report

---

### `_analyze_column(self, col: str) -> Dict[str, Any]`

Analyzes a single column based on its type.

- Counts nulls and unique values
- Calls specialized methods if it's a numeric, text, or date column

#### Parameters:

- `col`: Column name

#### Returns:

- A dictionary of column statistics

---

### `_analyze_numeric_column(self, series: pl.Series) -> Dict[str, Any]`

Analyzes a numeric column (integers or floats).

#### Includes:

- Min, max, mean, median, std deviation
- Count of zeros, negatives, and positives

#### Returns:

- Dictionary with stats or error info

---

### `_analyze_text_column(self, series: pl.Series) -> Dict[str, Any]`

Analyzes a text (string) column.

#### Includes:

- Average, min, and max string lengths
- Count of empty strings
- Top 10 most frequent values

#### Returns:

- Dictionary with stats or error info

---

### `_analyze_date_column(self, series: pl.Series) -> Dict[str, Any]`

Analyzes a date or datetime column.

#### Includes:

- Earliest and latest date
- Range in days between them

#### Returns:

- Dictionary with stats or error info

---

### `_analyze_data_quality(self) -> Dict[str, Any]`

Analyzes the overall quality of the data.

#### Includes:

- Total cells and nulls
- Null % and duplicate % across the whole dataset
- A completeness score (how much data is non-null)

#### Returns:

- Dictionary with quality metrics

---

### `_calculate_correlations(self) -> Dict[str, Any]`

Finds correlation between all numeric columns.

- Uses Pearson correlation
- Only works if there are at least 2 numeric columns

#### Returns:

- Dictionary of correlation matrix or a message if not applicable

---

### `_estimate_memory_usage(self) -> Dict[str, Any]`

Estimates how much memory the dataset uses.

#### Includes:

- Total memory in bytes and megabytes
- Estimated memory per row

#### Returns:

- Dictionary with memory usage info

---

### `get_column_suggestions(self) -> Dict[str, List[str]]`

Suggests columns for visualizations.

#### Groups columns by:

- **numeric**: numbers (for bar, line, histograms)
- **categorical**: low-cardinality text columns (for bar/pie charts)
- **date**: date/datetime columns (for time series)

#### Returns:

- Dictionary with column lists for each chart type
