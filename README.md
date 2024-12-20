# Cloudflare Full-Stack Demo

一个基于 Cloudflare Pages + D1 + R2 的全栈应用演示项目。展示了如何使用 Cloudflare 的服务构建一个包含数据库操作和文件存储的完整 Web 应用。

## 功能特性

- 🏗️ 基于 Vue 3 + TypeScript
- 📦 文件上传下载（Cloudflare R2 对象存储）
- 💾 客户信息 CRUD（Cloudflare D1 数据库）
- 🚀 自动化部署（Cloudflare Pages）

## 技术栈

### 前端

- Vue 3
- TypeScript
- Vite
- Vue Router
- Pinia
- Axios

### 后端 (Cloudflare)

- Pages Functions - Serverless 函数
- D1 - SQLite 数据库
- R2 - 对象存储
- Workers - Edge 计算平台

## 项目结构

```
├── functions/ # Cloudflare Pages Functions (函数接口)
│ ├── api/ # API 路由处理
│ │ ├── [[route]].ts # itty-router路由管理
│ │ └── customer.ts # 客户管理 API
│ │ └── storage.ts # 文件存储 API
│ └── utils/ # 工具函数
├── src/ # 前端源码
│ ├── api/ # API 调用封装
│ ├── components/ # Vue 组件
│ ├── router/ # 路由配置
│ ├── stores/ # Pinia 状态管理（没用上）
│ └── views/ # 页面组件
└── schema.sql # 数据库初始化脚本
└── wrangler.example.toml # wrangler 配置模板
```

## 快速开始

### 前置要求

- Node.js 20+
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)
- Cloudflare 账号

### 本地开发

1. 克隆项目并安装依赖

```bash
git clone git@github.com:kales0202/cfdemo.git
cd cfdemo
npm install
```

2. 创建 Cloudflare 服务

```bash
# 创建 D1 数据库
npx wrangler d1 create cf-demo
# 创建 R2 存储桶
npx wrangler r2 bucket create my-bucket
```

3. 配置项目
   复制 `wrangler.example.toml` 为 `wrangler.toml`，并填入你的配置：

```toml
name = "your-project-name"
compatibility_date = "2024-12-05"
[[d1_databases]]
binding = "DB"
database_name = "cf-demo"
database_id = "your-database-id"
[[r2_buckets]]
binding = "MY_BUCKET"
bucket_name = "your-bucket-name"
preview_bucket_name = "your-preview-bucket-name"
```

4. 初始化数据库

```bash
# 本地数据库初始化
npx wrangler d1 execute cf-demo --local --file=./schema.sql
# 远程数据库初始化（部署时需要）
npx wrangler d1 execute cf-demo --remote --file=./schema.sql
```

5. 启动开发服务器

```bash
# 预览模式（本地模拟 Cloudflare Pages）
npm run preview
```

## 部署

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)，创建一个新的 Pages 项目。

2. 配置构建设置：

   - 构建命令：`npm run build`
   - 输出目录：`dist`
   - Node.js 版本：20

3. 配置环境变量：

   TODO...

4. 执行部署：

   ```bash
   npm run deploy
   ```

## 核心功能说明

### 文件存储 (R2)

- 支持大文件分片上传
- 自动合并文件分片
- 支持文件直接下载
- 文件列表管理

### 数据库操作 (D1)

- 完整的 CRUD 操作支持

## 常用命令

```bash
# TODO...
```

## 注意事项

1. 本地开发限制

   - 本地开发时使用模拟的 D1 和 R2 环境
   - 某些 Cloudflare 特性在本地可能无法完全模拟

2. 文件上传限制

   - 单个文件最大支持 100MB，使用分片上传突破了限制

3. 数据库限制
   - D1 是基于 SQLite 的数据库
   - 适合中小规模应用

## 致谢

- [Cursor](https://cursor.sh/) - 本DEMO在 Cursor AI 的协助下完成开发

