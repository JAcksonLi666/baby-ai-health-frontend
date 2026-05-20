#!/bin/bash
# 本地构建 Docker 镜像脚本
# 用于在本地电脑构建镜像，然后导出到群晖

set -e

echo "=========================================="
echo "  宝宝健康档案 - Docker 镜像构建脚本"
echo "=========================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 项目目录
BACKEND_DIR="./baby-ai-health-backend"
FRONTEND_DIR="./baby-ai-health-frontend"
OUTPUT_DIR="./docker-images"

# 创建输出目录
mkdir -p $OUTPUT_DIR

echo -e "${YELLOW}[1/4] 检查项目目录...${NC}"
if [ ! -d "$BACKEND_DIR" ]; then
    echo -e "${RED}错误: 找不到后端目录 $BACKEND_DIR${NC}"
    exit 1
fi
if [ ! -d "$FRONTEND_DIR" ]; then
    echo -e "${RED}错误: 找不到前端目录 $FRONTEND_DIR${NC}"
    exit 1
fi
echo -e "${GREEN}✓ 项目目录检查通过${NC}"

echo -e "${YELLOW}[2/4] 构建后端镜像...${NC}"
cd $BACKEND_DIR
docker build -t baby-health-backend:latest .
echo -e "${GREEN}✓ 后端镜像构建完成${NC}"

cd ..

echo -e "${YELLOW}[3/4] 构建前端镜像...${NC}"
cd $FRONTEND_DIR
docker build -t baby-health-frontend:latest .
echo -e "${GREEN}✓ 前端镜像构建完成${NC}"

cd ..

echo -e "${YELLOW}[4/4] 导出镜像文件...${NC}"
docker save baby-health-backend:latest | gzip > $OUTPUT_DIR/baby-health-backend.tar.gz
docker save baby-health-frontend:latest | gzip > $OUTPUT_DIR/baby-health-frontend.tar.gz
echo -e "${GREEN}✓ 镜像导出完成${NC}"

# 显示文件大小
echo ""
echo "=========================================="
echo "  构建完成！"
echo "=========================================="
echo ""
echo "镜像文件位置: $OUTPUT_DIR/"
ls -lh $OUTPUT_DIR/
echo ""
echo -e "${GREEN}下一步操作:${NC}"
echo "1. 将 $OUTPUT_DIR 目录复制到群晖"
echo "2. 在群晖上执行:"
echo "   docker load < baby-health-backend.tar.gz"
echo "   docker load < baby-health-frontend.tar.gz"
echo "   docker-compose up -d"
echo ""
