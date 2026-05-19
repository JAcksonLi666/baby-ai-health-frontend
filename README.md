# 宝宝健康档案 AI 助手 - 前端

基于 React 18 + Vite + Ant Design 构建的婴幼儿健康档案管理前端应用。

## 📋 功能特性

### 核心功能
- 📤 **化验单上传**：支持图片和 PDF 上传，OCR 识别预览
- 📅 **日期自动识别**：从化验单自动提取日期，支持手动修改
- 🔍 **智能问答**：基于历史档案的 RAG 问答系统
- 📊 **档案管理**：完整的 CRUD 操作，支持筛选和编辑
- 🎨 **美观界面**：基于 Ant Design 的现代化 UI

### 新增功能 (v1.2.0)
- 📈 **今日汇总仪表盘**：睡眠、排泄、哭声数据概览
- 😴 **睡眠记录管理**：记录宝宝的入睡、醒来时间、睡眠质量
- 💩 **排泄记录管理**：记录尿布类型、颜色、便便状态
- 😭 **哭声记录管理**：记录哭闹类型、强度、持续时间和可能原因
- 🌐 **双 AI 层架构**：本地 RAG 检索 + 云端大模型（蚂蚁·安诊儿）
- 📚 **国家卫健委知识库**：内置婴幼儿照护指南知识库
- 🔧 **控制台调试日志**：实时显示 AI 调用详情（本地/云端模型）
- 🌍 **国际化支持**：中英文双语界面

## 🛠️ 技术栈

- **框架**: React 18
- **构建工具**: Vite 6.5.0
- **UI 组件**: Ant Design 5.x
- **日期处理**: Moment.js
- **HTTP 客户端**: Axios
- **图标**: @ant-design/icons

## 📁 项目结构

```
fontend/
├── src/
│   ├── components/         # React 组件
│   │   ├── Dashboard.jsx           # 今日汇总仪表盘
│   │   ├── Dashboard.css          # 仪表盘样式
│   │   ├── SleepRecords.jsx       # 睡眠记录管理
│   │   ├── SleepRecords.css       # 睡眠记录样式
│   │   ├── DiaperRecords.jsx      # 排泄记录管理
│   │   ├── DiaperRecords.css      # 排泄记录样式
│   │   ├── CryRecords.jsx         # 哭声记录管理
│   │   ├── CryRecords.css         # 哭声记录样式
│   │   ├── Upload.jsx             # 化验单上传组件
│   │   ├── Upload.css             # 上传组件样式
│   │   ├── Chat.jsx               # 智能问答组件
│   │   ├── Chat.css               # 问答组件样式
│   │   ├── RecordManagement.jsx   # 档案管理组件
│   │   └── RecordManagement.css   # 档案管理样式
│   ├── constants/          # 常量配置
│   │   └── cryConstants.js        # 哭声常量定义
│   ├── services/           # API 服务
│   │   └── apiService.js          # 后端 API 封装
│   ├── i18n.js             # 国际化配置
│   ├── App.jsx             # 主应用组件
│   ├── App.css             # 应用全局样式
│   ├── main.jsx            # 入口文件
│   └── index.css           # 全局基础样式
├── public/                 # 静态资源
│   └── vite.svg
├── index.html              # HTML 模板
├── package.json            # 项目依赖
├── vite.config.js          # Vite 配置
├── .env.example            # 环境变量示例
└── .gitignore              # Git 忽略规则
```

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn

### 安装依赖

```bash
cd fontend

# 安装依赖
npm install
```

### 配置环境变量

```bash
copy .env.example .env
```

编辑 `.env` 文件：

```env
# 后端服务地址
VITE_API_BASE_URL=http://localhost:8000
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173

### 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist` 目录。

## 🧩 核心组件

### 1. Upload.jsx - 化验单上传组件

功能：
- 文件选择与预览
- OCR 预识别（不保存）
- 日期自动识别与手动选择
- 记录类型选择
- 确认上传到数据库

### 2. Chat.jsx - 智能问答组件

功能：
- 问题输入
- 基于历史档案的回答
- 对话历史展示
- 支持本地/云端模型切换

### 3. RecordManagement.jsx - 档案管理组件

功能：
- 档案列表展示（分页）
- 按类型筛选
- 日期范围筛选
- 查看详情、编辑、删除操作

### 4. apiService.js - API 服务封装

提供统一的后端 API 调用：
- `uploadFile()` - 上传化验单
- `previewFile()` - 预识别文件
- `askQuestion()` - 智能问答
- `getRecords()` - 获取档案列表
- `getRecord()` - 获取单条档案
- `updateRecord()` - 更新档案
- `deleteRecord()` - 删除档案

## 🎨 组件样式说明

### Upload.css

- `.upload-container` - 上传组件容器
- `.preview-container` - 图片预览区域
- `.date-section` - 日期选择区域
- `.ocr-content-wrapper` - OCR 识别内容展示
- `.ocr-section-line` - 分隔线样式

### Chat.css

- `.chat-container` - 聊天容器
- `.chat-messages` - 消息列表
- `.chat-input` - 输入框区域
- `.message-bot` - 机器人消息
- `.message-user` - 用户消息

### RecordManagement.css

- `.record-container` - 档案管理容器
- `.filter-section` - 筛选区域
- `.record-table` - 档案列表表格
- `.actions` - 操作按钮组

## 🔧 配置说明

### vite.config.js

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
```

## 📡 API 接口

前端调用的主要后端接口：

### 基础功能
| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /upload | 上传化验单 |
| POST | /upload/preview | 预识别（仅识别不上传） |
| POST | /ask | 智能问答（非流式） |
| GET | /ask/stream | 智能问答（流式） |
| GET | /records | 获取档案列表 |
| GET | /record/{id} | 获取档案详情 |
| PUT | /record/{id} | 更新档案 |
| DELETE | /record/{id} | 删除档案 |

### 日常记录管理
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/sleep | 获取睡眠记录列表 |
| POST | /api/sleep | 创建睡眠记录 |
| PUT | /api/sleep/{id} | 更新睡眠记录 |
| DELETE | /api/sleep/{id} | 删除睡眠记录 |
| GET | /api/diaper | 获取排泄记录列表 |
| POST | /api/diaper | 创建排泄记录 |
| PUT | /api/diaper/{id} | 更新排泄记录 |
| DELETE | /api/diaper/{id} | 删除排泄记录 |
| GET | /api/cry | 获取哭声记录列表 |
| POST | /api/cry | 创建哭声记录 |
| PUT | /api/cry/{id} | 更新哭声记录 |
| DELETE | /api/cry/{id} | 删除哭声记录 |

### 仪表盘与知识库
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/today/summary | 获取今日汇总 |
| GET | /api/knowledge/search | 搜索知识库 |
| GET | /api/knowledge/status | 获取知识库状态 |

## ⚠️ 注意事项

1. **跨域配置**：确保后端服务配置了 CORS，允许前端访问
2. **后端依赖**：启动前端前请确保后端服务正在运行（http://localhost:8000）
3. **图标导入**：使用 Ant Design 图标时需使用 Outlined 后缀形式（如 `UploadOutlined`）

## 🔄 版本历史

- **v1.2.0 (2026-05-19)** - 完整功能版本
  - ✅ 添加今日汇总仪表盘（Dashboard）
  - ✅ 添加睡眠记录管理功能
  - ✅ 添加排泄记录管理功能
  - ✅ 添加哭声记录管理功能
  - ✅ 配置云端大模型（蚂蚁·安诊儿 Ling-2.6-1T）
  - ✅ 双 AI 层架构（本地 RAG + 云端大模型）
  - ✅ 前端添加控制台调试日志，实时显示 AI 调用详情
  - ✅ 完善国际化支持（中英文）
  - ✅ 修复前端图标导入问题
  - ✅ 修复 Ant Design 组件弃用警告

- **v1.1.0 (2026-05-18)** - 功能增强版本
  - ✅ 前端组件重构为 Ant Design
  - ✅ 日期组件使用 moment.js
  - ✅ 添加档案管理页面（查看、编辑、删除）
  - ✅ 修复导航菜单显示问题
  - ✅ 修复删除按钮显示问题
  - ✅ 修复文件上传按钮问题
  - ✅ OCR 识别结果美化排版

- **v1.0.0 (2026-05-16)** - MVP 版本
  - ✅ 基础上传功能
  - ✅ OCR 识别展示
  - ✅ 智能问答界面
  - ✅ 基础档案列表

## 📄 许可证

MIT License
