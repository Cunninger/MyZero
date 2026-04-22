# MyZero

An AI-powered academic writing assistant that polishes prose and reduces AI-generated text detection rates.

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

## Features

- **Paper Polish** — Improves language expression and academic writing quality
- **AIGC Humanizer** — Lowers AI-detection rates for generated text
- **Combined Optimize** — Polish + humanize in one pass
- **Mermaid Diagrams** — Generate and edit Mermaid flowcharts/diagrams with AI
- **LaTeX Converter** — Convert natural language descriptions to LaTeX formulas
- **Template Editor** — Customizable prompt templates
- **History** — Saved processing records with diff comparison
- **File Upload** — Drag & drop `.txt` files
- **Export** — Copy or download results as text; Mermaid diagrams as SVG/PNG

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, Tailwind CSS, Lucide Icons |
| Backend | FastAPI, SQLAlchemy, SQLite, Pydantic |
| AI | OpenAI-compatible API (works with DeepSeek, OpenAI, Claude, Gemini, etc.) |

## Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- An OpenAI-compatible API key

### Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env — add your API key and preferred provider URL
python -m app.main
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

### Windows Scripts

Double-click `start-backend.bat` then `start-frontend.bat`.

## Configuration

Configure via the Settings page in the app, or edit `backend/.env` directly:

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | Your API key | *(required)* |
| `OPENAI_BASE_URL` | API endpoint | `https://api.openai.com/v1` |
| `OPENAI_MODEL` | Default model | `gpt-3.5-turbo` |
| `POLISH_MODEL` | Model for polishing | *(falls back to OPENAI_MODEL)* |
| `HUMANIZE_MODEL` | Model for humanizing | *(falls back to OPENAI_MODEL)* |

Any OpenAI-compatible API works — just change the base URL and model name.

## Keyboard Shortcuts

- `Ctrl + Enter` — Submit
- `Esc` — Cancel / close

## Project Structure

```
MyZero/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app entry
│   │   ├── config.py         # Settings (pydantic-settings)
│   │   ├── database.py       # SQLAlchemy setup
│   │   ├── models.py         # DB models
│   │   ├── schemas.py        # Pydantic schemas
│   │   ├── routers/          # API routes
│   │   └── services/         # Business logic
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/            # Route pages
│   │   ├── App.jsx
│   │   └── index.css
│   ├── tailwind.config.js
│   └── vite.config.js
├── LICENSE
└── README.md
```

## Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'Add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

## License

This project is licensed under the [GNU General Public License v3.0](LICENSE).
