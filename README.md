<p align="center">
  <img width="160" src="./assets/logo.png" alt="MyZero logo">
</p>

<h1 align="center">MyZero</h1>

<p align="center">
  AI 学术写作助手 — 文本润色、AIGC 降重与综合优化
</p>

<p align="center">
  <a href="https://github.com/cunninger/MyZero/releases"><img src="https://img.shields.io/github/v/release/cunninger/MyZero?style=flat-square" alt="Release"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-GPL--3.0-blue?style=flat-square" alt="License"></a>
  <a href="https://github.com/cunninger/MyZero/stargazers"><img src="https://img.shields.io/github/stars/cunninger/MyZero?style=flat-square" alt="Stars"></a>
  <img src="https://img.shields.io/badge/Python-3.10+-3776ab?style=flat-square&logo=python&logoColor=white" alt="Python">
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/github/last-commit/cunninger/MyZero?style=flat-square" alt="Last Commit">
  <br>
  <b>中文</b> | <a href="./README.en.md">English</a>
</p>

<p align="center">
  <a href="https://github.com/cunninger/MyZero/releases/latest">
    <img src="https://img.shields.io/badge/⬇%20下载%20Windows%20安装包-2ea44f?style=for-the-badge" alt="Download">
  </a>
</p>

---

## 📑 目录

- [✨ 特性](#-特性)
- [📸 界面预览](#-界面预览)
- [🚀 快速开始](#-快速开始)
- [⚙️ 配置说明](#️-配置说明)
- [⌨️ 快捷键](#️-快捷键)
- [📁 项目结构](#-项目结构)
- [🤝 参与贡献](#-参与贡献)
- [📄 许可证](#-许可证)

---

## ✨ 特性

| 功能 | 说明 |
|------|------|
| ✍️ 文本润色 | 提升语言表达与学术写作质量 |
| 🛡️ AIGC 降重 | 降低文本的 AI 检测率 |
| 🔄 综合优化 | 一键完成润色 + 降重 |
| 📊 Mermaid 图表 | 用 AI 生成与编辑 Mermaid 流程图/示意图 |
| 🧮 LaTeX 转换 | 将自然语言描述转换为 LaTeX 公式 |
| 📝 模板编辑器 | 自定义提示词模板 |
| 📜 历史记录 | 保存处理记录，支持差异对比 |
| 📂 文件上传 | 拖拽上传 `.txt` 文件 |
| 💾 导出结果 | 复制或下载文本；Mermaid 图表导出 SVG/PNG |

---

## 📸 界面预览

> 你可以在此区域放置应用截图或演示 GIF，让读者直观了解界面效果。
>
> 建议尺寸：宽度 `800px` 左右，使用 `./assets/screenshot.png` 引用。

---

## 🚀 快速开始

### 环境要求

- Python 3.10+
- Node.js 18+
- OpenAI 兼容的 API Key

### 1. 启动后端

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# 编辑 .env — 填入你的 API Key 和服务商地址
python -m app.main
```

### 2. 启动前端

```bash
cd frontend
npm install
npm run dev
```

打开 http://localhost:5173

### Windows 快捷启动

双击 `start-backend.bat` 和 `start-frontend.bat` 即可快速启动前后端服务。

---

## ⚙️ 配置说明

可通过应用内的「设置」页面配置，或直接编辑 `backend/.env`：

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `OPENAI_API_KEY` | API 密钥 | *(必填)* |
| `OPENAI_BASE_URL` | API 接口地址 | `https://api.openai.com/v1` |
| `OPENAI_MODEL` | 默认模型 | `gpt-3.5-turbo` |
| `POLISH_MODEL` | 润色专用模型 | 默认使用 `OPENAI_MODEL` |
| `HUMANIZE_MODEL` | 降重专用模型 | 默认使用 `OPENAI_MODEL` |

> 任何 OpenAI 兼容的 API 均可使用，只需修改接口地址与模型名称。

---

## ⌨️ 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl + Enter` | 提交优化 |
| `Esc` | 取消 / 关闭弹窗 |

---

## 📁 项目结构

<details>
<summary>点击展开</summary>

```
MyZero/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI 入口
│   │   ├── config.py        # 配置项 (pydantic-settings)
│   │   ├── database.py      # SQLAlchemy 数据库
│   │   ├── models.py        # 数据模型
│   │   ├── schemas.py       # Pydantic 校验模式
│   │   ├── routers/         # API 路由
│   │   └── services/        # 业务逻辑
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/      # React 组件
│   │   ├── pages/           # 页面路由
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

## 🤝 参与贡献

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/my-feature`)
3. 提交更改 (`git commit -m '添加新功能'`)
4. 推送到分支 (`git push origin feature/my-feature`)
5. 发起 Pull Request

---

## 📄 许可证

本项目基于 [GNU General Public License v3.0](LICENSE) 开源。
