# cfdemo

Cloudflare Pages + D1 +R2 Demo

## 技术栈

- Cloudflare Pages
- Cloudflare D1
- Cloudflare R2
- Vue 3
- TypeScript
- Vite
- Pinia
- Vue Router
- ESLint
- Prettier

## 配置说明

1. 创建 D1 数据库并获取配置：
```bash
npx wrangler d1 create cf-demo
```

2. 将返回的配置信息添加到 `wrangler.toml` 文件中：
```toml
[[d1_databases]]
binding = "DB"
database_name = "cf-demo"
database_id = "<your-database-id>"
```

## 常用命令

```bash
# 创建本地数据库
npx wrangler d1 create cf-demo
# 执行数据库初始化脚本（本地）
npx wrangler d1 execute cf-demo --local --file=./schema.sql
# 执行数据库初始化脚本（远程）
npx wrangler d1 execute cf-demo --remote --file=./schema.sql

# 查看数据库
npx wrangler d1 list
# 查看全部的表
npx wrangler d1 execute cf-demo --command="SELECT name FROM sqlite_master WHERE type='table';"
# 删除数据库
npx wrangler d1 delete cf-demo
```
