<p align="center">
  <img width="160" src="./assets/logo.png" alt="MyZero logo">
</p>

<h1 align="center">MyZero</h1>

<p align="center">
  AI-powered academic writing assistant — polish prose, humanize AI text
</p>

<p align="center">
  <a href="https://github.com/cunninger/MyZero/releases"><img src="https://img.shields.io/github/v/release/cunninger/MyZero?style=flat-square" alt="Release"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-GPL--3.0-blue?style=flat-square" alt="License"></a>
  <img src="https://img.shields.io/badge/Python-3.10+-3776ab?style=flat-square&logo=python&logoColor=white" alt="Python">
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/github/last-commit/cunninger/MyZero?style=flat-square" alt="Last Commit">
  <br>
  <a href="./README.md">中文</a> | <b>English</b>
</p>

<p align="center">
  <a href="https://github.com/cunninger/MyZero/releases/latest">
    <img src="https://img.shields.io/badge/%E2%AC%87%20Download%20Windows%20Setup-2ea44f?style=for-the-badge" alt="Download">
  </a>
</p>

---

## 📑 Table of Contents

- [Features](#-features)
- [Preview](#-preview)
- [Quick Start](#-quick-start)
- [Configuration](#%EF%B8%8F-configuration)
- [Keyboard Shortcuts](#%EF%B8%8F-keyboard-shortcuts)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| ✍️ Paper Polish | Improves language expression and academic writing quality |
| 🛡️ AIGC Humanizer | Lowers AI-detection rates for generated text |
| 🔄 Combined Optimize | Polish + humanize in one pass |
| 📊 Mermaid Diagrams | Generate and edit Mermaid flowcharts/diagrams with AI |
| 🧮 LaTeX Converter | Convert natural language descriptions to LaTeX formulas |
| 📝 Template Editor | Customizable prompt templates |
| 📜 History | Saved processing records with diff comparison |
| 📂 File Upload | Drag & drop `.txt` files |
| 💾 Export | Copy or download results as text; Mermaid diagrams as SVG/PNG |

---

## 📸 Preview

> Place app screenshots or demo GIFs here so readers can quickly understand the UI.
>
> Recommended width: around `800px`. Reference via `./assets/screenshot.png`.

---

## 🚀 Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- An OpenAI-compatible API key

### 1. Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env — add your API key and provider URL
python -m app.main
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

### Windows Quick Launch

Double-click `start-backend.bat` and `start-frontend.bat` to launch both services.

---

## ⚙️ Configuration

Configure via the in-app Settings page, or edit `backend/.env` directly:

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | Your API key | *(required)* |
| `OPENAI_BASE_URL` | API endpoint | `https://api.openai.com/v1` |
| `OPENAI_MODEL` | Default model | `gpt-3.5-turbo` |
| `POLISH_MODEL` | Model for polishing | Falls back to `OPENAI_MODEL` |
| `HUMANIZE_MODEL` | Model for humanizing | Falls back to `OPENAI_MODEL` |

> Any OpenAI-compatible API works — just change the base URL and model name.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + Enter` | Submit |
| `Esc` | Cancel / close modal |

---

## 📁 Project Structure

<details>
<summary>Click to expand</summary>

```
MyZero/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI entry
│   │   ├── config.py        # Settings (pydantic-settings)
│   │   ├── database.py      # SQLAlchemy setup
│   │   ├── models.py        # DB models
│   │   ├── schemas.py       # Pydantic schemas
│   │   ├── routers/         # API routes
│   │   └── services/        # Business logic
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Route pages
│   │   ├── App.jsx
│   │   └── index.css
│   ├── tailwind.config.js
│   └── vite.config.js
├── assets/
│   └── logo.png
├── LICENSE
└── README.md
```

</details>

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'Add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the [GNU General Public License v3.0](LICENSE).
