# AI 对话系统

ChatGPT 风格对话系统，FastAPI + Next.js + 阿里云百炼 DeepSeek。

## 功能概览

- 会话管理：新建 / 切换 / 删除
- 流式对话：普通模式 + 推理模式（`enable_thinking`）
- Markdown / 代码高亮渲染
- 无需登录

---

## 方式一：Docker 部署（推荐）

### 前置要求

- Docker Desktop 或 Docker Engine + Docker Compose v2

### 步骤

1. 复制环境变量文件并填入 API Key：

```bash
copy .env.example .env
# 编辑 .env，设置 DASHSCOPE_API_KEY=sk-...
```

2. 构建并启动：

```bash
docker compose up -d --build
```

3. 访问：

- 前端：http://localhost:3000
- 后端健康检查：http://localhost:8080/health

4. 停止服务：

```bash
docker compose down
```

### Docker 环境变量说明

| 变量 | 必填 | 说明 |
|------|------|------|
| `DASHSCOPE_API_KEY` | 是 | 阿里云百炼 API Key |
| `NEXT_PUBLIC_API_URL` | 否 | 浏览器访问后端的地址，默认 `http://localhost:8080` |
| `CORS_ORIGINS` | 否 | 允许的前端来源，默认 `http://localhost:3000` |
| `FRONTEND_PORT` | 否 | 前端映射端口，默认 `3000` |
| `BACKEND_PORT` | 否 | 后端映射端口，默认 `8080` |

### 部署到云服务器

假设服务器 IP 为 `123.45.67.89`，在 `.env` 中设置：

```env
DASHSCOPE_API_KEY=sk-...
NEXT_PUBLIC_API_URL=http://123.45.67.89:8080
CORS_ORIGINS=http://123.45.67.89:3000
```

然后重新构建前端（`NEXT_PUBLIC_API_URL` 在构建时注入）：

```bash
docker compose up -d --build
```

> 数据持久化：SQLite 数据库保存在 Docker volume `backend-data` 中。

---

## 方式二：本地开发

### 后端

```bash
cd backend
pip install -r requirements.txt
copy .env.example .env   # 填入 DASHSCOPE_API_KEY
alembic upgrade head
uvicorn app.main:app --reload --port 8080
```

### 前端

```bash
cd frontend
npm install
copy .env.local.example .env.local
npm run dev
```

访问 http://localhost:3000

---

## 对话模式

使用同一模型 `deepseek-v4-pro`，通过 `enable_thinking` 切换：

| 前端模式 | 后端参数 | 说明 |
|----------|----------|------|
| 普通模式 | `enable_thinking: false` | 直接输出回答 |
| 推理模式 | `enable_thinking: true` | 先输出思考过程，再输出回答 |

## API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/health` | 健康检查 |
| GET | `/api/sessions` | 会话列表 |
| POST | `/api/sessions` | 创建会话 |
| GET | `/api/sessions/{id}` | 会话详情 |
| PATCH | `/api/sessions/{id}` | 重命名 |
| DELETE | `/api/sessions/{id}` | 删除会话 |
| POST | `/api/chat/stream` | SSE 流式对话 |
