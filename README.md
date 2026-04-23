<p align="center">
  <img src="assets/logo.png" width="140" alt="MyZero Logo" />
</p>

<h1 align="center">MyZero</h1>
<p align="center">AI 学术写作助手 — 文本润色、AIGC 降重与综合优化</p>

<p align="center">
  <a href="#english-version">English</a> · 中文
</p>

---

## 功能特性

- **文本润色** — 提升语言表达与学术写作质量
- **AIGC 降重** — 降低文本的 AI 检测率
- **综合优化** — 一键完成润色 + 降重
- **Mermaid 图表** — 用 AI 生成与编辑 Mermaid 流程图/示意图
- **LaTeX 转换** — 将自然语言描述转换为 LaTeX 公式
- **模板编辑器** — 自定义提示词模板
- **历史记录** — 保存处理记录，支持差异对比
- **文件上传** — 拖拽上传 `.txt` 文件
- **导出结果** — 复制或下载文本结果；Mermaid 图表导出 SVG/PNG

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18, Vite, Tailwind CSS, Lucide Icons |
| 后端 | FastAPI, SQLAlchemy, SQLite, Pydantic |
| AI | OpenAI 兼容 API（支持 DeepSeek、OpenAI、Claude、Gemini 等） |

## 快速开始

### 环境要求

- Python 3.10+
- Node.js 18+
- OpenAI 兼容的 API Key

### 启动后端

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# 编辑 .env — 填入你的 API Key 和服务商地址
python -m app.main
```

### 启动前端

```bash
cd frontend
npm install
npm run dev
```

打开 http://localhost:5173

### Windows 快捷脚本

双击 `start-backend.bat` 和 `start-frontend.bat` 即可快速启动。

## 配置说明

可通过应用内的「设置」页面配置，或直接编辑 `backend/.env`：

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `OPENAI_API_KEY` | API 密钥 | *(必填)* |
| `OPENAI_BASE_URL` | API 接口地址 | `https://api.openai.com/v1` |
| `OPENAI_MODEL` | 默认模型 | `gpt-3.5-turbo` |
| `POLISH_MODEL` | 润色专用模型 | *(默认使用 OPENAI_MODEL)* |
| `HUMANIZE_MODEL` | 降重专用模型 | *(默认使用 OPENAI_MODEL)* |

任何 OpenAI 兼容的 API 均可使用，只需修改接口地址与模型名称。

## 快捷键

- `Ctrl + Enter` — 提交
- `Esc` — 取消 / 关闭

## 项目结构

```
MyZero/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI 入口
│   │   ├── config.py         # 配置项 (pydantic-settings)
│   │   ├── database.py       # SQLAlchemy 数据库
│   │   ├── models.py         # 数据模型
│   │   ├── schemas.py        # Pydantic 校验模式
│   │   ├── routers/          # API 路由
│   │   └── services/         # 业务逻辑
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/       # React 组件
│   │   ├── pages/            # 页面路由
│   │   ├── App.jsx
│   │   └── index.css
│   ├── tailwind.config.js
│   └── vite.config.js
├── LICENSE
└── README.md
```

## 参与贡献

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/my-feature`)
3. 提交更改 (`git commit -m '添加新功能'`)
4. 推送到分支 (`git push origin feature/my-feature`)
5. 发起 Pull Request

## 许可证

本项目基于 [GNU General Public License v3.0](LICENSE) 开源。

---

<a id="english-version"></a>

<h1 align="center">MyZero</h1>
<p align="center">AI-powered academic writing assistant — polish prose, humanize AI text</p>

<p align="center">
  <a href="https://github.com/cunninger/HumanizeAI-MyZero/releases">
    <img alt="GitHub Release" src="https://img.shields.io/github/v/release/cunninger/HumanizeAI-MyZero">
  </a>
  <a href="LICENSE">
    <img alt="License: GPL v3" src="https://img.shields.io/badge/License-GPLv3-blue.svg">
  </a>
</p>

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
