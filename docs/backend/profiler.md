# Data Profiler Documentation

## Overview

The `DataProfiler` class analyzes your CSV data and creates a comprehensive report. It examines every column, finds patterns, calculates statistics, and gives you insights about data quality.

Think of it as your data detective that tells you everything important about your dataset.

## Key Features

- **Column Analysis**: Statistics for numeric, text, and date columns
- **Data Quality**: Missing values, duplicates, completeness scores
- **Correlations**: How numeric columns relate to each other
- **Memory Usage**: Estimates of how much space your data uses
- **Chart Suggestions**: Recommends which columns work best for visualizations

## Quick Start

```python
# Create profiler and generate report
profiler = DataProfiler(df)
profile = profiler.generate_profile()

# Get column suggestions for charts
suggestions = profiler.get_column_suggestions()
```

## Core Methods

### `generate_profile()`

Creates a complete analysis of your data.

**What you get back:**

```python
{
    "basic_info": {
        "shape": {"rows": 1000, "columns": 5},
        "columns": ["name", "age", "salary", "department"],
        "memory_usage": {"total_mb": 2.5, "per_row_bytes": 45}
    },
    "column_analysis": {
        "age": {
            "dtype": "Int64",
            "null_count": 5,
            "unique_count": 45,
            "min": 22, "max": 65, "mean": 38.5
        }
    },
    "missing_values": {"age": 5, "name": 0},
    "data_quality": {
        "null_percentage": 2.1,
        "duplicate_rows": 3,
        "completeness_score": 97.9
    },
    "correlations": {"age": {"salary": 0.75}},
    "sample_data": [{"name": "John", "age": 25}]  # First 10 rows
}
```

### `get_column_suggestions()`

Recommends which columns to use for different types of charts.

**Returns:**

```python
{
    "numeric": ["age", "salary", "years_experience"],      # Good for bar charts, histograms
    "categorical": ["department", "status", "level"],      # Good for pie charts, groups
    "date": ["hire_date", "last_review"],                  # Good for time series
    "all": ["name", "age", "salary", "department"]         # All columns
}
```

## Column Analysis Details

### Numeric Columns

For numbers (age, salary, temperature):

- **Basic stats**: min, max, mean, median, standard deviation
- **Data distribution**: count of zeros, negative, positive values
- **Quality checks**: missing values, outliers

### Text Columns

For text (names, categories, descriptions):

- **Length analysis**: average, minimum, maximum character length
- **Content quality**: empty strings, most common values
- **Uniqueness**: how many different values exist

### Date Columns

For dates and timestamps:

- **Date range**: earliest and latest dates in your data
- **Time span**: how many days the data covers
- **Quality**: missing dates, invalid formats

## Data Quality Metrics

### Completeness Score

Percentage of non-missing data across your entire dataset.

- **90-100%**: Excellent data quality
- **80-89%**: Good, minor cleanup needed
- **70-79%**: Fair, some missing data issues
- **Below 70%**: Poor, significant data quality problems

### Duplicate Detection

Finds exact duplicate rows in your data.

- **0-5%**: Normal amount of duplicates
- **5-20%**: Moderate duplicates, consider cleaning
- **Above 20%**: High duplicates, definitely needs cleanup

### Missing Values Analysis

Shows which columns have the most missing data.

- **0%**: Perfect column
- **1-10%**: Minor missing data
- **10-30%**: Moderate issues
- **Above 30%**: Major data collection problems

## Correlations

For numeric columns, shows how strongly they're related:

- **0.8 to 1.0**: Very strong positive relationship
- **0.5 to 0.8**: Moderate positive relationship
- **-0.5 to 0.5**: Weak or no relationship
- **-0.8 to -0.5**: Moderate negative relationship
- **-1.0 to -0.8**: Very strong negative relationship

**Example:**

```python
correlations = {
    "age": {"salary": 0.75}  # Older employees tend to earn more
}
```

## Memory Usage Estimation

Helps you understand your data's size:

- **Total MB**: Overall dataset size
- **Per row bytes**: Average memory per row
- **Scaling insights**: How much memory you'd need for larger datasets

## Common Use Cases

### Data Quality Assessment

```python
profiler = DataProfiler(df)
profile = profiler.generate_profile()

quality = profile["data_quality"]
print(f"Data is {quality['completeness_score']:.1f}% complete")
print(f"Found {quality['duplicate_rows']} duplicate rows")
```

### Column Selection for Analysis

```python
suggestions = profiler.get_column_suggestions()

# Get numeric columns for correlation analysis
numeric_cols = suggestions["numeric"]

# Get categorical columns for grouping
category_cols = suggestions["categorical"]
```

### Quick Data Overview

```python
profile = profiler.generate_profile()
info = profile["basic_info"]

print(f"Dataset: {info['shape']['rows']} rows, {info['shape']['columns']} columns")
print(f"Memory usage: {info['memory_usage']['total_mb']} MB")
```

## Error Handling

The profiler handles common data issues gracefully:

- **Mixed data types**: Analyzes what it can, reports errors for problematic columns
- **Empty datasets**: Provides meaningful error messages
- **Corrupt data**: Skips problematic rows and continues analysis
- **Memory issues**: Uses efficient processing for large datasets

## Performance Notes

- **Fast Analysis**: Uses Polars for efficient processing
- **Memory Efficient**: Processes data without creating unnecessary copies
- **Scalable**: Works well on datasets from small (100 rows) to large (1M+ rows)

The profiler gives you instant insights into your data's structure, quality, and characteristics, helping you make informed decisions about cleaning, analysis, and visualization.
