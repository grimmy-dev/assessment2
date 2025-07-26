# 📊 Smart CSV Analyzer & Predictor

<div align="center">

![Smart CSV Analyzer](https://github.com/user-attachments/assets/ec103f75-2f2a-4a7a-97ea-2faa745c0273)

**A simple web app for exploring CSV files, generating insights, and testing ML predictions—all from your browser**

[🎥 Watch Demo](https://drive.google.com/file/d/1Qj3NxcxS-mCWg55kc3SYlgCHoAK75rg9/view?usp=drive_link) • [🚀 Live Demo](#) • [📖 Documentation](#)

[![Next.js](https://img.shields.io/badge/Next.js-black?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.12+-3776ab?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

</div>

## ✨ Features

<table>
<tr>
<td width="50%">

### 📤 **Smart File Upload**

- Drag & drop CSV files (up to 50MB)
- Real-time upload progress
- Automatic file validation

### 📈 **Data Insights**

- Dataset overview (rows, columns, size)
- Data quality scoring
- Missing values detection
- Column type analysis

</td>
<td width="50%">

### 📊 **Interactive Charts**

- Universal chart builder
- Multiple visualization types
- Real-time data exploration

### 🤖 **ML Predictions**

- Test predictions with custom inputs
- Model confidence scores
- Live prediction results

</td>
</tr>
</table>

### 🔄 **Real-time Updates**

- WebSocket progress tracking
- Live logs and status updates
- Instant feedback on operations

---

## 🚀 Quick Start

### Prerequisites

Make sure you have these installed:

- **Node.js** (v18 or higher)
- **Python** (3.12 or higher)
- **pnpm** (recommended) or npm

### 1️⃣ Clone & Setup

```bash
git clone https://github.com/grimmy-dev/assessment2.git
cd assessment2
```

### 2️⃣ Install Dependencies

```bash
# Install frontend dependencies
pnpm install
```

### 3️⃣ Start the Application

**🎯 Option 1: Run Everything (Recommended)**

```bash
pnpm run dev:full
```

**🔧 Option 2: Run Separately**

```bash
# Terminal 1: Backend
pnpm run fastapi-dev

# Terminal 2: Frontend
pnpm run dev
```

### 4️⃣ Open Your Browser

- **🌐 Main App**: http://localhost:3000
- **📚 API Docs**: http://localhost:8000/docs

---

## 📁 Project Structure

```
assessment2/
├── 📂 data/                   # Sample CSV files
│   └── testing_dataset.csv    # Ready-to-use sample data
├── 📂 src/
│   ├── 📂 api/                 # FastAPI backend
│   │   ├── routes/            # API routes
│   │   └── main.py            # Main endpoint
│   │
│   └── 📂 app/                # Next.js frontend
│       ├── components/        # React components
│       ├── pages/             # App pages
│       └── styles/            # CSS & styling
├── package.json               # Frontend dependencies
├── requirements.txt           # Python dependencies
└── README.md                  # This file
```

---

## 🎯 How to Use

### Step 1: Upload Your Data

<img src="https://via.placeholder.com/400x200/4f46e5/ffffff?text=Upload+CSV+File" alt="Upload interface" width="400"/>

Drag and drop your CSV file or click to browse. The app supports files up to 50MB.

### Step 2: Explore & Analyze

<img src="https://via.placeholder.com/400x200/059669/ffffff?text=Data+Analysis" alt="Analysis dashboard" width="400"/>

View data quality metrics, column information, and interactive visualizations.

### Step 3: Test Predictions

<img src="https://via.placeholder.com/400x200/dc2626/ffffff?text=ML+Predictions" alt="Prediction interface" width="400"/>

Input custom values and get instant ML predictions with confidence scores.

---

## 🛠️ Technology Stack

<div align="center">

| Frontend                                                                                            | Backend                                                                                  | AI/ML                                                                                                    |
| --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| ![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js)             | ![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi) | ![scikit-learn](https://img.shields.io/badge/scikit--learn-F7931E?style=for-the-badge&logo=scikit-learn) |
| ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript)   | ![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python)    | ![pandas](https://img.shields.io/badge/pandas-150458?style=for-the-badge&logo=pandas)                    |
| ![Tailwind CSS](https://img.shields.io/badge/Tailwind-38B2AC?style=for-the-badge&logo=tailwind-css) | ![WebSocket](https://img.shields.io/badge/WebSocket-010101?style=for-the-badge)          | ![NumPy](https://img.shields.io/badge/NumPy-013243?style=for-the-badge&logo=numpy)                       |

</div>

---

## Try It Now

Don't have a CSV file? No problem! Use our sample dataset:

```
📁 /data/testing_dataset.csv
```

This file is perfect for exploring all features of the application.

---

## 📋 Available Scripts

| Command                | Description                     |
| ---------------------- | ------------------------------- |
| `pnpm run dev:full`    | Start both frontend and backend |
| `pnpm run dev`         | Start frontend only             |
| `pnpm run fastapi-dev` | Start backend only              |
| `pnpm run build`       | Build for production            |
| `pnpm run lint`        | Run code linting                |

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

---

## 🆘 Need Help?

- 🐛 **Found a bug?** [Open an issue](https://github.com/grimmy-dev/assessment2/issues)
- 💡 **Have a suggestion?** [Start a discussion](https://github.com/grimmy-dev/assessment2/discussions)

---

<div align="center">

**Made with ❤️ for data enthusiasts**

[⭐ Star this repo](https://github.com/grimmy-dev/assessment2) if you found it helpful!

</div>
