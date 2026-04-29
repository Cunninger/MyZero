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
pip install -r requirements-dev.txt   # 安装开发依赖（lint、format）
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

采用简化版 GitFlow：

| 分支 | 用途 |
|------|------|
| `main` | 稳定版本，永远可发布 |
| `develop` | 日常开发集成 |
| `feat/xxx` | 新功能 |
| `fix/xxx` | Bug 修复 |
| `docs/xxx` | 文档更新 |
| `release/vX.Y.Z` | 版本发布准备 |
| `hotfix/xxx` | 紧急修复 |

**日常开发流程：**
1. 从 `develop` 切出新分支：`git checkout -b feat/xxx`
2. 开发完成后推送到远程
3. 在 GitHub 发起 Pull Request，目标分支选 `develop`
4. CI 通过后合并到 `develop`

**发版流程：**
1. 从 `develop` 切出 `release/vX.Y.Z`
2. 更新版本号和 CHANGELOG
3. PR 到 `main`，合并后打 tag `vX.Y.Z` 触发自动打包

详见 [RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md)。

## Commit Message 规范

采用 [Conventional Commits](https://www.conventionalcommits.org/) 风格：

| 类型 | 用途 |
|------|------|
| `feat:` | 新功能 |
| `fix:` | 修复问题 |
| `docs:` | 文档更新 |
| `style:` | 代码格式（不影响逻辑） |
| `refactor:` | 重构 |
| `test:` | 测试相关 |
| `chore:` | 构建/依赖/CI 等杂项 |

示例：
```
feat: 添加批量导入功能
fix: 修复设置面板保存失败的问题
docs: 更新 README 安装说明
```

## 代码风格

- **Python**：使用 Ruff 进行格式化和检查。提交前运行：
  ```bash
  cd backend
  ruff check .
  ruff format .
  ```
- **JavaScript / React**：使用 ESLint + Prettier。提交前运行：
  ```bash
  cd frontend
  npm run lint
  npm run format
  ```

## 提交 PR 流程

1. Fork 本仓库（或直接在原仓库创建分支）
2. 从 `develop` 切出新分支：`git checkout -b feat/xxx`
3. 提交代码：`git commit -m "feat: xxx"`
4. 推送到远程：`git push origin feat/xxx`
5. 在 GitHub 发起 Pull Request，**目标分支选 `develop`**
6. 填写 PR 模板，等待 CI 通过
7. 合并后删除 feature 分支

## 遇到问题？

可以在 [Discussions](https://github.com/cunninger/MyZero/discussions) 发起讨论，或在 [Issues](https://github.com/cunninger/MyZero/issues) 提交反馈。
