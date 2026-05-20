# 群晖 DS218 部署指南

本指南专门针对 **群晖 DS218** (Intel Celeron J3355, x86_64架构) 编写。

---

## 前置条件

### 1. 安装套件
在群晖 **套件中心** 安装以下套件：
- ✅ **Docker** (必装)
- ✅ **Git Server** (可选，用于拉取代码)
- ✅ **文本编辑器** (可选，用于编辑配置)

### 2. 确认架构
DS218 是 **x86_64** 架构，支持标准 Docker 镜像。

---

## 部署步骤

### 步骤 1: 创建项目目录

通过 **SSH** 连接群晖，或使用 **File Station**：

```bash
# SSH 连接群晖
ssh admin@你的群晖IP

# 创建项目目录
mkdir -p /volume1/docker/baby-health
cd /volume1/docker/baby-health
```

### 步骤 2: 克隆代码仓库

```bash
# 克隆后端
git clone https://github.com/JAcksonLi666/baby-ai-health-backend.git

# 克隆前端
git clone https://github.com/JAcksonLi666/baby-ai-health-frontend.git
```

### 步骤 3: 配置环境变量

```bash
# 创建环境变量文件
cat > .env << 'EOF'
OPENAI_API_KEY=你的OpenAI_API_Key
EOF
```

### 步骤 4: 创建数据目录

```bash
# 创建数据存储目录
mkdir -p backend-data
chmod 777 backend-data
```

### 步骤 5: 下载群晖专用配置

```bash
# 下载群晖专用 docker-compose
curl -o docker-compose.yml https://raw.githubusercontent.com/JAcksonLi666/baby-ai-health-frontend/main/docker-compose-synology.yml
```

或者手动创建 `docker-compose.yml` 文件。

### 步骤 6: 启动服务

```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

---

## 访问应用

部署成功后，通过以下地址访问：

| 服务 | 地址 | 说明 |
|------|------|------|
| **前端** | http://群晖IP:3010 | Web 界面 |
| **后端 API** | http://群晖IP:8100 | API 服务 |
| **API 文档** | http://群晖IP:8100/docs | Swagger UI |

---

## 端口说明

| 端口 | 服务 | 备注 |
|------|------|------|
| 3010 | 前端 | 可修改为其他端口 |
| 8100 | 后端 | 可修改为其他端口 |

如需修改端口，编辑 `docker-compose.yml` 中的 `ports` 配置。

---

## 常用命令

```bash
# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 更新代码后重启
cd baby-ai-health-backend && git pull
cd ../baby-ai-health-frontend && git pull
cd .. && docker-compose restart

# 查看后端日志
docker-compose logs -f backend

# 查看前端日志
docker-compose logs -f frontend

# 进入后端容器
docker exec -it baby-health-backend bash
```

---

## 数据备份

数据存储在 `/volume1/docker/baby-health/backend-data` 目录：

```bash
# 备份数据
tar -czvf baby-health-backup-$(date +%Y%m%d).tar.gz backend-data/

# 恢复数据
tar -xzvf baby-health-backup-20260520.tar.gz
```

---

## 故障排除

### 问题 1: 端口被占用
```bash
# 查看端口占用
netstat -tlnp | grep 3010
netstat -tlnp | grep 8100

# 修改 docker-compose.yml 中的端口
```

### 问题 2: 权限问题
```bash
# 给予数据目录权限
chmod -R 777 backend-data/
```

### 问题 3: 容器无法启动
```bash
# 查看详细日志
docker-compose logs backend
docker-compose logs frontend

# 重新构建
docker-compose down
docker-compose up -d --build
```

### 问题 4: API 连接失败
前端需要配置后端 API 地址，编辑前端环境变量：
```bash
# 在 docker-compose.yml 中添加
environment:
  - VITE_API_BASE_URL=http://你的群晖IP:8100
```

---

## 群晖 Docker 界面操作

如果不使用 SSH，也可以通过群晖 Docker 套件界面操作：

1. 打开 **Docker** 套件
2. 点击 **项目** → **新增**
3. 选择 `docker-compose.yml` 文件
4. 点击 **创建**

---

## 更新应用

```bash
# 拉取最新代码
cd baby-ai-health-backend && git pull origin main
cd ../baby-ai-health-frontend && git pull origin main

# 重启服务
cd .. && docker-compose restart
```

---

## 卸载

```bash
# 停止并删除容器
docker-compose down

# 删除镜像（可选）
docker rmi python:3.11-slim node:18-alpine

# 删除数据（谨慎！）
rm -rf backend-data/
```

---

## 联系支持

如有问题，请访问 GitHub 仓库提交 Issue：
- 后端: https://github.com/JAcksonLi666/baby-ai-health-backend
- 前端: https://github.com/JAcksonLi666/baby-ai-health-frontend
