# 📊 Smart CSV Analyzer & Predictor

<div align="center">

![Smart CSV Analyzer](https://github.com/user-attachments/assets/ec103f75-2f2a-4a7a-97ea-2faa745c0273)

*A simple web app for exploring CSV files, generating insights, and testing ML predictions—all from your browser*

[🎥 Watch Demo](https://drive.google.com/file/d/1Qj3NxcxS-mCWg55kc3SYlgCHoAK75rg9/view?usp=drive_link) • [📖 Documentation](https://github.com/grimmy-dev/assessment2/tree/main/docs)

[![Next.js](https://img.shields.io/badge/Next.js-black?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.12+-3776ab?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

</div>

## ✨ Features

### 📤 File Upload
- Upload CSV files (up to 50MB)
- Real-time upload progress
- Automatic file validation

### 📈 Data Insights
- Dataset overview (rows, columns, size)
- Data quality scoring
- Missing values detection
- Column type analysis

### 📊 Interactive Charts
- Universal chart builder
- Multiple visualization types
- Real-time data exploration

### 🤖 ML Predictions
- Test predictions with custom inputs
- Model confidence scores
- Live prediction results

### 🔄 Real-time Updates
- WebSocket progress tracking
- Live logs and status updates
- Instant feedback on operations
---

## Quick Start

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

**Option 1: Run Everything (Recommended)**

```bash
pnpm run dev:full
```

**Option 2: Run Separately**

```bash
# Terminal 1: Backend
pnpm run fastapi-dev

# Terminal 2: Frontend
pnpm run dev
```

### 4️⃣ Open Your Browser

- **Main App**: `http://localhost:3000`
- **Debug API**: `http://localhost:8000/docs`

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

## 🛠️ Technology Stack
<div align="center" style="border: 1px solid #ccc; border-radius: 12px;">
<table>
<tr>
<td align="center" width="120">
<img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" width="100"/>
</td>
<td align="center" width="120">
<img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" width="100"/>
</td>
<td align="center" width="120">
<img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" width="100"/>
</td>
<td align="center" width="120">
<img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" width="100"/>
</td>
<td align="center" width="120">
<img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" width="100"/>
</td>
</tr>
<tr>
<td align="center" width="120">
<img src="https://img.shields.io/badge/WebSocket-010101?style=for-the-badge&logo=socketdotio&logoColor=white" alt="WebSocket" width="100"/>
</td>
<td align="center" width="120">
<img src="https://img.shields.io/badge/scikit--learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white" alt="scikit-learn" width="100"/>
</td>
<td align="center" width="120">
<img src="https://img.shields.io/badge/pandas-150458?style=for-the-badge&logo=pandas&logoColor=white" alt="pandas" width="100"/>
</td>
<td align="center" width="120">
<img src="https://img.shields.io/badge/NumPy-013243?style=for-the-badge&logo=numpy&logoColor=white" alt="NumPy" width="100"/>
</td>
<td align="center" width="120">
<img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" width="100"/>
</td>
</tr>
</table>
</div>

---

## 🎯 How to Use

<div align="center">
  
![CSV file Uploader](https://github.com/user-attachments/assets/d5306790-22e5-4f1d-9a54-1ab77b512118)
  
---

![Data Analysis Dashboard](https://github.com/user-attachments/assets/95e3dcc8-1c64-4ff7-a01b-cffc6cc21d1f)

---

![ML Prediction Interface](https://github.com/user-attachments/assets/c0065ac6-69f4-4137-8906-04172a1cfea2)
</div>

---


## 💡 Try It Now

Don't have a CSV file? No problem! Use our sample dataset:

```bash
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
3. **Commit** your changes (`git commit-m 'Add amazing feature'`)
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
