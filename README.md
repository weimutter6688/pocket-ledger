# Pocket Ledger - 个人记账应用

这是一个基于[Next.js](https://nextjs.org)框架开发的个人记账应用。

## 功能特点

- 收支记录管理
- 分类统计与分析
- 多用户支持
- Docker容器化部署

## 开发指南

### 本地开发

首先，运行开发服务器：

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
# 或
bun dev
```

使用浏览器访问[http://localhost:3000](http://localhost:3000)查看应用。

您可以通过修改`app/page.tsx`文件开始编辑页面。该页面会随着您编辑文件而自动更新。

### 了解更多

要了解更多关于Next.js的信息，请查看以下资源：

- [Next.js文档](https://nextjs.org/docs) - 了解Next.js的功能和API
- [学习Next.js](https://nextjs.org/learn) - 交互式Next.js教程

## Docker部署指南

本应用已经容器化，可以通过Docker轻松部署和运行。

### 使用Docker Compose运行

```bash
# 启动应用
docker-compose -f docker-compose.optimized.yml up -d

# 查看日志
docker logs pocket-ledger

# 停止应用
docker-compose -f docker-compose.optimized.yml down
```

### 访问应用

应用运行后，可以通过浏览器访问：

```
http://localhost:3000
```

### 默认账户

系统已预先创建了一个管理员账户，可以直接使用：

- **用户名**: admin
- **密码**: admin123

### 自定义用户和密码

您可以通过以下步骤创建自定义用户：

1. 访问应用的注册页面：`http://localhost:3000/register`
2. 填写用户名、密码和确认密码
3. 点击"注册"按钮完成用户创建

您也可以通过修改环境变量来设置初始管理员账户：

```bash
# .env文件中设置
ADMIN_USERNAME=您的用户名
ADMIN_PASSWORD=您的密码
```

这些环境变量将在应用首次启动时用于创建管理员账户。如果数据库中已存在用户，则这些设置将被忽略。

### 默认分类

登录后，系统已预先创建了以下分类：

1. 餐饮食品
2. 交通出行
3. 购物消费
4. 居家住房
5. 娱乐休闲
6. 医疗健康
7. 教育学习
8. 人情往来
9. 金融理财
10. 其他支出

## 生产环境部署

### 使用PM2部署和管理

在生产环境中，推荐使用PM2来管理Next.js应用：

1. 首先安装PM2：

```bash
npm install -g pm2
```

2. 构建应用：

```bash
npm run build
```

3. 使用PM2启动应用：

```bash
# 基本启动
pm2 start npm --name "pocket-ledger" -- start

# 或使用配置文件启动
pm2 start ecosystem.config.js
```

4. PM2常用管理命令：

```bash
# 查看应用状态
pm2 status

# 查看应用日志
pm2 logs pocket-ledger

# 重启应用
pm2 restart pocket-ledger

# 停止应用
pm2 stop pocket-ledger

# 设置开机自启
pm2 startup
pm2 save
```

5. ecosystem.config.js配置示例：

```javascript
module.exports = {
  apps: [
    {
      name: 'pocket-ledger',
      script: 'npm',
      args: 'start',
      instances: 'max',
      exec_mode: 'cluster',
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};
```

### 其他部署选项

您可以参考以下文档了解更多关于Next.js应用部署的信息：

- [Next.js部署文档](https://nextjs.org/docs/app/building-your-application/deploying)
