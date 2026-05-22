# 宝宝健康档案 AI 助手 - 前端

基于 React 18 + Vite + Ant Design 构建的婴幼儿健康档案管理前端应用。

## 📋 功能特性

### 核心功能
- 📤 **化验单上传**：支持图片和 PDF 上传，OCR 识别预览
- 📅 **日期自动识别**：从化验单自动提取日期，支持手动修改
- 🔍 **智能问答**：基于历史档案的 RAG 问答系统
- 📊 **档案管理**：完整的 CRUD 操作，支持筛选和编辑
- 🎨 **美观界面**：基于 Ant Design 的现代化 UI

### v1.2.0 新增
- 📈 **今日汇总仪表盘**：睡眠、排泄、哭声数据概览
- 😴 **睡眠记录管理**：记录宝宝的入睡、醒来时间、睡眠质量
- 💩 **排泄记录管理**：记录尿布类型、颜色、便便状态
- 😭 **哭声记录管理**：记录哭闹类型、强度、持续时间和可能原因
- 🌐 **双 AI 层架构**：本地 RAG 检索 + 云端大模型（蚂蚁·安诊儿）
- 📚 **国家卫健委知识库**：内置婴幼儿照护指南知识库
- 🔧 **控制台调试日志**：实时显示 AI 调用详情（本地/云端模型）
- 🌍 **国际化支持**：中英文双语界面

### v1.3.0 新增
- 🍼 **喂养记录管理**：母乳/配方奶/辅食/喝水，支持哺乳侧和奶量记录
- 📏 **生长发育记录**：体重、身高、头围、体温记录
- 📈 **WHO 生长曲线图表**：基于 Recharts 绘制的生长曲线对比图
- 📊 **仪表盘增强**：集成喂养和生长发育数据概览
- ⏰ **dayjs 替换 moment.js**：减少约 300KB 包体积

### v1.4.0 新增
- 🧪 **化验单 AI 解析**：输入化验指标数据，AI 自动解析并评估
- 📋 **指标状态高亮**：正常/偏低/偏高/危急行级颜色标识
- 🩺 **症状自查**：8 大类 40+ 症状选择，AI 分析可能原因
- 💬 **对话历史管理**：查看历史 AI 对话记录，支持新建和删除
- 📱 **响应式设计**：移动端自适应布局
- 🌍 **国际化完善**：新组件全面支持中英文切换

### v1.5.0 新增
- 📱 **Capacitor 移动端打包**：支持将 Web 应用打包为 Android APK
- 🗂️ **树状导航菜单**：按功能分类组织的层级菜单结构（Dashboard、日常记录、健康管理、AI 助手）
- 🚦 **React Router 路由控制**：前端路由统一管理，支持 URL 直接访问
- 🌍 **国际化完善**：GrowthChart 组件和导航菜单支持中英文切换
- 🔧 **PWA 配置**：vite-plugin-pwa 插件，支持"添加到主屏幕"功能

## 🛠️ 技术栈

- **框架**: React 18
- **构建工具**: Vite 6.5.0
- **UI 组件**: Ant Design 5.x
- **路由**: React Router v6
- **日期处理**: dayjs
- **图表**: Recharts
- **HTTP 客户端**: Axios
- **国际化**: react-i18next
- **图标**: @ant-design/icons
- **PWA**: vite-plugin-pwa
- **移动打包**: Capacitor

## 📁 项目结构

```
frontend/
├── src/
│   ├── components/              # React 组件
│   │   ├── Dashboard.jsx            # 今日汇总仪表盘
│   │   ├── Dashboard.css            # 仪表盘样式
│   │   ├── SleepRecords.jsx         # 睡眠记录管理
│   │   ├── SleepRecords.css         # 睡眠记录样式
│   │   ├── DiaperRecords.jsx        # 排泄记录管理
│   │   ├── DiaperRecords.css        # 排泄记录样式
│   │   ├── CryRecords.jsx           # 哭声记录管理
│   │   ├── CryRecords.css           # 哭声记录样式
│   │   ├── FeedingRecords.jsx       # 喂养记录管理 (v1.3.0)
│   │   ├── FeedingRecords.css       # 喂养记录样式
│   │   ├── GrowthRecords.jsx        # 生长发育记录 (v1.3.0)
│   │   ├── GrowthRecords.css        # 生长发育记录样式
│   │   ├── GrowthChart.jsx          # WHO 生长曲线图表 (v1.3.0)
│   │   ├── LabReportParser.jsx      # 化验单 AI 解析 (v1.4.0)
│   │   ├── LabReportParser.css      # 化验单解析样式 (v1.4.0)
│   │   ├── SymptomChecker.jsx       # 症状自查 (v1.4.0)
│   │   ├── ChatHistory.jsx          # 对话历史 (v1.4.0)
│   │   ├── Upload.jsx               # 化验单上传组件
│   │   ├── Upload.css               # 上传组件样式
│   │   ├── Chat.jsx                 # 智能问答组件
│   │   ├── Chat.css                 # 问答组件样式
│   │   ├── RecordManagement.jsx     # 档案管理组件
│   │   └── RecordManagement.css     # 档案管理样式
│   ├── constants/              # 常量配置
│   │   └── cryConstants.js          # 哭声常量定义
│   ├── services/               # API 服务
│   │   └── apiService.js            # 后端 API 封装
│   ├── i18n.js                 # 国际化配置（中英文）
│   ├── App.jsx                 # 主应用组件（导航 + 路由）
│   ├── App.css                 # 应用全局样式
│   ├── main.jsx                # 入口文件
│   └── index.css               # 全局基础样式
├── public/                     # 静态资源
│   └── vite.svg
├── index.html                  # HTML 模板
├── package.json                # 项目依赖
├── vite.config.js              # Vite 配置（含 PWA 和 Capacitor）
├── capacitor.config.json       # Capacitor 配置
├── .env.example                # 环境变量示例
└── .gitignore                  # Git 忽略规则
```

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn

### 安装依赖

```bash
cd frontend

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

### 1. Dashboard.jsx - 今日汇总仪表盘

功能：
- 睡眠/排泄/哭声/喂养/生长发育数据概览
- AI 智能洞察建议
- 快速导航到各记录页面

### 2. Upload.jsx - 化验单上传组件

功能：
- 文件选择与预览
- OCR 预识别（不保存）
- 日期自动识别与手动选择
- 记录类型选择
- 确认上传到数据库

### 3. Chat.jsx - 智能问答组件

功能：
- 问题输入
- 基于历史档案的回答
- 对话历史展示
- 支持本地/云端模型切换
- 流式输出显示

### 4. LabReportParser.jsx - 化验单 AI 解析 (v1.4.0)

功能：
- 选择报告类型（血液常规/尿液常规/肝功能/肾功能）
- 输入宝宝月龄
- 粘贴或输入化验指标数据
- AI 自动解析并评估指标状态
- 行级颜色高亮（正常/偏低/偏高/危急）
- 统计摘要（总指标数/正常/异常/危急）

### 5. SymptomChecker.jsx - 症状自查 (v1.4.0)

功能：
- 8 大症状分类（发热/呼吸/消化/皮肤/睡眠/口腔/眼部/耳部）
- 40+ 症状复选框
- 输入宝宝月龄
- AI 分析可能原因和严重程度
- 常见原因标签和注意事项列表
- 免责声明提示

### 6. ChatHistory.jsx - 对话历史 (v1.4.0)

功能：
- 对话会话列表（按更新时间排序）
- 新建对话会话
- 查看会话消息历史（气泡式聊天界面）
- 删除对话会话（带确认弹窗）
- 相对时间显示

### 7. FeedingRecords.jsx - 喂养记录 (v1.3.0)

功能：
- 记录母乳/配方奶/辅食/喝水
- 支持哺乳侧选择和奶量/时长记录
- 完整的增删改查操作

### 8. GrowthRecords.jsx - 生长发育记录 (v1.3.0)

功能：
- 记录体重、身高、头围、体温
- 完整的增删改查操作
- 支持查看最新记录

### 9. GrowthChart.jsx - 生长曲线图表 (v1.3.0)

功能：
- 基于 Recharts 绘制折线图
- 对比 WHO 标准生长曲线
- 支持体重/身高/头围多指标切换

### 10. RecordManagement.jsx - 档案管理组件

功能：
- 档案列表展示（分页）
- 按类型筛选
- 日期范围筛选
- 查看详情、编辑、删除操作

### 11. apiService.js - API 服务封装

提供统一的后端 API 调用：

| 服务对象 | 方法 | 对应后端 API |
|----------|------|-------------|
| `uploadService` | `previewFile()` | POST /upload/preview |
| `uploadService` | `uploadFile()` | POST /upload |
| `chatService` | `askQuestion()` | POST /ask |
| `chatService` | `askQuestionStream()` | GET /ask/stream |
| `recordService` | `getRecords()` / `getRecord()` / `updateRecord()` / `deleteRecord()` | /records CRUD |
| `sleepService` | `createRecord()` / `listRecords()` / `updateRecord()` / `deleteRecord()` | /api/sleep CRUD |
| `diaperService` | `createRecord()` / `listRecords()` / `updateRecord()` / `deleteRecord()` | /api/diaper CRUD |
| `cryService` | `createRecord()` / `listRecords()` / `analyzeReason()` | /api/cry CRUD + analyze |
| `feedingService` | `createRecord()` / `listRecords()` / `updateRecord()` / `deleteRecord()` | /api/feeding CRUD |
| `growthService` | `createRecord()` / `listRecords()` / `getLatest()` | /api/growth CRUD |
| `dashboardService` | `getTodaySummary()` | GET /api/today/summary |
| `knowledgeService` | `search()` / `getStatus()` | /api/knowledge |
| `labReportService` | `parse()` / `evaluate()` | /api/lab-report |
| `symptomService` | `analyze()` / `getCategories()` | /api/symptom |
| `chatHistoryService` | `createSession()` / `listSessions()` / `getSessionMessages()` / `deleteSession()` | /api/chat/sessions |

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
| GET/POST | /api/sleep | 睡眠记录 CRUD |
| GET/POST | /api/diaper | 排泄记录 CRUD |
| GET/POST | /api/cry | 哭声记录 CRUD |
| GET/POST | /api/feeding | 喂养记录 CRUD (v1.3.0) |
| GET/POST | /api/growth | 生长发育记录 CRUD (v1.3.0) |

### 仪表盘与知识库
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/today/summary | 获取今日汇总 |
| GET | /api/knowledge/search | 搜索知识库 |
| GET | /api/knowledge/status | 获取知识库状态 |

### AI 功能 (v1.4.0)
| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/lab-report/parse | 化验单 AI 解析 |
| POST | /api/lab-report/evaluate | 化验单指标评估 |
| POST | /api/symptom/analyze | 症状分析 |
| GET | /api/symptom/categories | 获取症状分类 |
| GET/POST/DELETE | /api/chat/sessions | 对话历史管理 |

## ⚠️ 注意事项

1. **跨域配置**：确保后端服务配置了 CORS，允许前端访问
2. **后端依赖**：启动前端前请确保后端服务正在运行（http://localhost:8000）
3. **图标导入**：使用 Ant Design 图标时需使用 Outlined 后缀形式（如 `UploadOutlined`）
4. **国际化**：新组件使用 `useTranslation` hook，翻译键定义在 `src/i18n.js` 中
5. **响应式**：使用 Ant Design 的 `Row`/`Col` 组件配合 `xs/sm/md/lg` 断点实现移动端适配

## 🔄 版本历史

- **v1.5.0 (2026-05-22)** - 移动端版本
  - ✅ Capacitor 移动端打包支持（Android APK）
  - ✅ 树状导航菜单重构（按功能分类：Dashboard、日常记录、健康管理、AI 助手）
  - ✅ React Router v6 路由集成
  - ✅ GrowthChart 组件国际化支持
  - ✅ 导航菜单国际化支持
  - ✅ vite-plugin-pwa 插件配置
  - ✅ 图标组件导入修复（AlertCircleOutlined、BabyOutlined、DropOutlined）
  - ✅ Recharts 图表库安装与配置

- **v1.4.0 (2026-05-21)** - AI 增强版本
  - ✅ 添加化验单 AI 解析页面（LabReportParser）
  - ✅ 添加症状自查页面（SymptomChecker）
  - ✅ 添加对话历史页面（ChatHistory）
  - ✅ 导航栏新增 3 个入口
  - ✅ 全面国际化支持（中英文）
  - ✅ 移动端响应式设计优化
  - ✅ 移除无效 Tailwind CSS 类名
  - ✅ 修复 Math.random() React key 不稳定问题
  - ✅ 添加化验单行级颜色高亮样式

- **v1.3.0 (2026-05-20)** - 成长管理版本
  - ✅ 添加喂养记录管理页面（FeedingRecords）
  - ✅ 添加生长发育记录页面（GrowthRecords）
  - ✅ 添加 WHO 生长曲线图表（GrowthChart）
  - ✅ 仪表盘集成喂养和生长发育数据
  - ✅ dayjs 替换 moment.js（减少 ~300KB）
  - ✅ 修复 EventSource 泄漏问题
  - ✅ 修复 Ant Design 组件弃用警告

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
