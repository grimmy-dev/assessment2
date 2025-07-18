# Smart CSV Analyzer & Predictor

A full-stack web application that lets users upload CSV files, analyze data, visualize statistics, and test machine learning model predictions — all from a simple interface.

---

## Features

- Upload CSV files (max 50MB)
- View profiling: missing values, memory usage, column types, and more
- Interactive data visualizations
- Test predictions with your own inputs
- Live logs and progress updates via WebSocket

---

## Project Structure

```
/data   → Sample CSV files (e.g., test_data.csv)
/src    → FastAPI backend + Next JS frontend
/api    → FastAPI backend code
/app    → Next JS frontend code
```

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/grimmy-dev/assessment2.git
cd your-repo
```

### 2. Install dependencies

```bash
# For frontend (Next.js)
pnpm install

# For backend (FastAPI)
cd src
pip install -r requirements.txt
cd ..
```

### 3. Run the project

#### Option 1: Run both frontend and backend together

```bash
pnpm run dev:full
```

This uses [`concurrently`](https://www.npmjs.com/package/concurrently) to run both:

- The main server `http://localhost:3000`
- FastAPI server for debugging `http://localhost:8000/docs`
- Next.js frontend at `http://localhost:3000`

#### Option 2: Run separately

**Backend:**

```bash
pnpm run fastapi-dev
```

**Frontend:**

```bash
pnpm run dev
```

---

## Test Dataset

You can try the app using the sample CSV file located at:

```
/data/testing_dataset.csv
```

---

## Scripts

| Script                 | Description                            |
| ---------------------- | -------------------------------------- |
| `pnpm run dev`         | Start Next.js frontend with TurboPack  |
| `pnpm run fastapi-dev` | Start FastAPI backend with hot reload  |
| `pnpm run dev:full`    | Run both frontend and backend together |

---

## Requirements

- [Node.js](https://nodejs.org/) (latest is good as of 2025)
- [pnpm](https://pnpm.io/) (optinal)
- [Python](https://www.python.org/) (v3.8+)
- `pip` for installing Python dependencies
