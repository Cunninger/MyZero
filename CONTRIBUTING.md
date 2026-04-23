# Contributing to MyZero

感谢你对 MyZero 的关注！以下是参与贡献的指南。

## 开发环境搭建

### 环境要求

- Python 3.10+
- Node.js 18+
- Git

### 启动后端

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# 编辑 .env 填入你的 API Key
python -m app.main
```

### 启动前端

```bash
cd frontend
npm install
npm run dev
```

打开 http://localhost:5173

## 分支规范

- `main`：稳定分支，受保护
- `feature/xxx`：新功能
- `fix/xxx`：Bug 修复
- `docs/xxx`：文档更新

## Commit Message 规范

采用 [Conventional Commits](https://www.conventionalcommits.org/) 风格：

```
feat: 添加某某功能
fix: 修复某某问题
docs: 更新文档
refactor: 重构某模块
chore: 构建/依赖更新
```

## 提交 PR 流程

1. Fork 本仓库
2. 从 `main` 切出新分支：`git checkout -b feature/xxx`
3. 提交代码：`git commit -m "feat: xxx"`
4. 推送到你的 Fork：`git push origin feature/xxx`
5. 在 GitHub 发起 Pull Request，填写 PR 模板

## 代码风格

- Python：PEP 8
- JavaScript / React：项目已配置 ESLint / Prettier，提交前确保无格式错误

## 遇到问题？

可以在 [Discussions](https://github.com/cunninger/MyZero/discussions) 发起讨论，或在 [Issues](https://github.com/cunninger/MyZero/issues) 提交反馈。
