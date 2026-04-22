# MyZero Startup Guide

## Configuration

Copy the example env file and add your API key:

```bash
cd backend
cp .env.example .env
# Edit .env with your API key and preferred provider
```

## Quick Start

### Option 1: Startup Scripts (Windows)

Double-click `start-backend.bat` to start the backend, then `start-frontend.bat` for the frontend.

### Option 2: Manual

**Backend:**
```bash
cd backend
pip install -r requirements.txt
python -m app.main
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Option 3: Python Virtual Environment

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or: .\venv\Scripts\activate  # Windows
pip install -r requirements.txt
python -m app.main
```

## Access

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Notes

1. Start the backend before the frontend
2. Configure your API key in `backend/.env` or via the Settings page
