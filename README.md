# Smart CSV Analyzer & Predictor
<img width="1574" height="874" alt="Aanalyzer" src="https://github.com/user-attachments/assets/ec103f75-2f2a-4a7a-97ea-2faa745c0273" />
A simple web app that helps you explore CSV files, get quick stats, draw charts, and test predictions—all from your browser. Great for learning and basic data analysis.

[watch demo video](https://drive.google.com/file/d/1Qj3NxcxS-mCWg55kc3SYlgCHoAK75rg9/view?usp=drive_link)

# What Can You Do With This?

- **Upload CSV Files** (up to 50MB).
- **See Data Info**: Spot empty values, see types (text, numbers), and memory usage.
- **View Charts**: Make simple data visualizations with a universal chart.
- **Try Predictions**: Input your own values and test model results.
- **Track Progress**: See live logs while the app works through websocket.

# Project Folders

```
/data     - Sample CSVs (like `test_data.csv`)
/src      - Backend (FastAPI) & Frontend (Next.js)
/api      - FastAPI backend code
/app      - Next.js frontend code
```

# How to Set Up

## 1. Download the Project

```sh
git clone https://github.com/grimmy-dev/assessment2.git
cd assessment2
```

## 2. Install the Tools

For the frontend (Next.js):
  ```sh
  pnpm install
  ```
For the backend (FastAPI made simple):
  ```sh
  pnpm run fastapi-dev
  ```

## 3. Start the App

**Option 1: Run Everything Together**

```sh
pnpm run dev:full
```

Go to:
  - Main App: `http://localhost:3000`
  - API Docs: `http://localhost:8000/docs`

**Option 2: Run Frontend and Backend Separately**

Backend:
  ```sh
  pnpm run fastapi-dev
  ```
Frontend:
  ```sh
  pnpm run dev
  ```

# Try It Out

There’s a sample CSV at `/data/testing_dataset.csv` so you can experiment right away.

# Requirement Checklist

- [x] Node.js (latest is best)
- [x] pnpm (optional for installing frontend stuff)
- [x] Python 3.12 or newer
- [x] pip (for Python installations)

You’re all set—happy exploring :)
