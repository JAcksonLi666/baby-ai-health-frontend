# 群晖 DS218 部署指南 (镜像方式)

> 版本：v1.8.1 (2026-05-30) — 自洽性修复版本

本指南专门针对 **群晖 DS218** (Intel Celeron J3355, x86_64架构) 编写。

使用**镜像方式**部署，无需在群晖上编译代码，启动更快。

---

## 部署流程概览

```
本地电脑                    群晖 DS218
   │                           │
   ├─1. 构建镜像               │
   ├─2. 导出镜像文件           │
   ├─────────────────────────→ │
   │                           ├─3. 导入镜像
   │                           ├─4. 配置环境变量
   │                           └─5. 启动服务
```

---

## 第一步：本地构建镜像

### 1.1 准备环境

确保本地电脑已安装：
- Docker Desktop
- Git

### 1.2 克隆代码

```bash
# 克隆仓库
git clone https://github.com/JAcksonLi666/baby-ai-health-backend.git
git clone https://github.com/JAcksonLi666/baby-ai-health-frontend.git
```

### 1.3 运行构建脚本

```bash
# 下载构建脚本
curl -O https://raw.githubusercontent.com/JAcksonLi666/baby-ai-health-frontend/main/build-images.sh
chmod +x build-images.sh

# 执行构建
./build-images.sh
```

构建完成后，会在 `docker-images/` 目录生成：
- `baby-health-backend.tar.gz` (约 500MB)
- `baby-health-frontend.tar.gz` (约 50MB)

---

## 第二步：上传到群晖

### 方式一：通过 File Station

1. 打开群晖 **File Station**
2. 创建文件夹 `/docker/baby-health`
3. 上传以下文件：
   - `baby-health-backend.tar.gz`
   - `baby-health-frontend.tar.gz`
   - `docker-compose-synology.yml`

### 方式二：通过 SCP

```bash
# 上传文件到群晖
scp docker-images/*.tar.gz admin@群晖IP:/volume1/docker/baby-health/
scp docker-compose-synology.yml admin@群晖IP:/volume1/docker/baby-health/
```

---

## 第三步：群晖导入镜像

通过 **SSH** 连接群晖：

```bash
# SSH 连接
ssh admin@群晖IP

# 进入项目目录
cd /volume1/docker/baby-health

# 导入镜像
docker load < baby-health-backend.tar.gz
docker load < baby-health-frontend.tar.gz

# 验证镜像
docker images | grep baby-health
```

---

## 第四步：配置环境变量

```bash
# 创建环境变量文件
cat > .env << 'EOF'
OPENAI_API_KEY=你的OpenAI_API_Key
EOF

# 创建数据目录
mkdir -p data
chmod 777 data
```

---

## 第五步：启动服务

```bash
# 使用群晖专用配置启动
docker-compose -f docker-compose-synology.yml up -d

# 查看服务状态
docker-compose -f docker-compose-synology.yml ps

# 查看日志
docker-compose -f docker-compose-synology.yml logs -f
```

---

## 访问应用

| 服务 | 地址 | 说明 |
|------|------|------|
| **前端** | http://群晖IP:3010 | 宝宝健康档案系统 |
| **后端 API** | http://群晖IP:8100 | API 服务 |
| **API 文档** | http://群晖IP:8100/docs | Swagger UI |

---

## 端口说明

| 端口 | 服务 | 备注 |
|------|------|------|
| 5000 | 群晖 DSM | 群晖管理界面（已占用）|
| 3010 | 宝宝健康前端 | 可修改 |
| 8100 | 宝宝健康后端 | 可修改 |

---

## 常用命令

```bash
# 停止服务
docker-compose -f docker-compose-synology.yml down

# 重启服务
docker-compose -f docker-compose-synology.yml restart

# 查看日志
docker-compose -f docker-compose-synology.yml logs -f backend
docker-compose -f docker-compose-synology.yml logs -f frontend

# 进入容器
docker exec -it baby-health-backend bash
```

---

## 更新应用

当有新版本时：

1. **本地**：拉取最新代码，重新构建镜像
   ```bash
   cd baby-ai-health-backend && git pull
   cd ../baby-ai-health-frontend && git pull
   cd .. && ./build-images.sh
   ```

2. **上传**：将新镜像上传到群晖

3. **群晖**：导入新镜像并重启
   ```bash
   docker-compose -f docker-compose-synology.yml down
   docker load < baby-health-backend.tar.gz
   docker load < baby-health-frontend.tar.gz
   docker-compose -f docker-compose-synology.yml up -d
   ```

---

## 数据备份

数据存储在 `/volume1/docker/baby-health/data` 目录：

```bash
# 备份
tar -czvf backup-$(date +%Y%m%d).tar.gz data/

# 恢复
tar -xzvf backup-20260520.tar.gz
```

---

## 故障排除

### 问题 1: 镜像导入失败
```bash
# 检查文件是否完整
ls -lh *.tar.gz

# 重新下载/上传文件
```

### 问题 2: 端口冲突
```bash
# 查看端口占用
netstat -tlnp | grep 3010
netstat -tlnp | grep 8100

# 修改 docker-compose-synology.yml 中的端口
```

### 问题 3: 容器无法启动
```bash
# 查看详细日志
docker logs baby-health-backend
docker logs baby-health-frontend

# 检查环境变量
cat .env
```

### 问题 4: API 连接失败
检查前端是否正确连接后端：
```bash
# 测试后端 API
curl http://localhost:8100/health
```

---

## 文件清单

部署完成后，群晖上的文件结构：

```
/volume1/docker/baby-health/
├── baby-health-backend.tar.gz   # 后端镜像文件（可删除）
├── baby-health-frontend.tar.gz  # 前端镜像文件（可删除）
├── docker-compose-synology.yml  # Docker Compose 配置
├── .env                         # 环境变量
└── data/                        # 数据存储目录
    ├── sleep_records.json
    ├── diaper_records.json
    ├── cry_records.json
    ├── feeding_records.json
    └── growth_records.json
```

---

## 联系支持

如有问题，请访问 GitHub 仓库提交 Issue：
- 后端: https://github.com/JAcksonLi666/baby-ai-health-backend
- 前端: https://github.com/JAcksonLi666/baby-ai-health-frontend
