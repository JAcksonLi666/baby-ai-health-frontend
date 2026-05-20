# 宝宝健康档案 AI 助手 Docker 部署

本目录包含使用 Docker Compose 部署宝宝健康档案 AI 助手所需的配置文件。

## 快速启动

### 1. 准备工作

确保已安装以下软件：
- Docker (20.10+)
- Docker Compose (2.0+)

### 2. 配置环境变量

创建 `.env` 文件并配置必要的环境变量：

```bash
# 后端 API 密钥
OPENAI_API_KEY=your-openai-api-key-here
```

### 3. 启动服务

```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 4. 访问应用

- 前端: http://localhost:3000
- 后端 API: http://localhost:8000
- API 文档: http://localhost:8000/docs

## 服务说明

### 后端 (backend)
- 端口: 8000
- 功能: API 服务、OCR、向量数据库
- 数据存储: `backend-data` Docker 卷

### 前端 (frontend)
- 端口: 3000
- 功能: Web UI、PWA 支持
- 特性: Nginx 静态文件服务

## 常用命令

```bash
# 停止服务
docker-compose down

# 重新构建镜像
docker-compose build --no-cache

# 重启服务
docker-compose restart

# 进入后端容器
docker-compose exec backend /bin/bash

# 查看后端日志
docker-compose logs -f backend

# 清理未使用的镜像
docker image prune -f
```

## 数据备份

后端数据存储在 Docker 卷 `backend-data` 中：

```bash
# 备份数据
docker run --rm -v baby-health_backend-data:/data -v $(pwd):/backup alpine tar czf /backup/backup.tar.gz /data

# 恢复数据
docker run --rm -v baby-health_backend-data:/data -v $(pwd):/backup alpine tar xzf /backup/backup.tar.gz -C /
```

## 故障排除

### 服务无法启动
```bash
# 检查 Docker 状态
docker ps -a

# 查看详细日志
docker-compose logs
```

### 端口冲突
修改 `docker-compose.yml` 中的端口映射：
```yaml
ports:
  - "3001:80"  # 修改前端端口
```

### API 连接失败
确保前端环境变量 `VITE_API_BASE_URL` 指向正确的后端地址。
