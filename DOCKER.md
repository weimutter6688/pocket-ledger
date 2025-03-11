# Pocket Ledger 容器化文档

本文档详细说明了Pocket Ledger应用的容器化过程、配置和使用方法。

## 容器化架构

Pocket Ledger的Docker容器化采用了以下架构：

- **基础镜像**: Node.js 20 Alpine
- **运行时环境**: Next.js生产环境
- **数据存储**: SQLite数据库 (使用Docker卷持久化)
- **用户认证**: JWT认证，可自定义默认账户

## 容器文件说明

- **Dockerfile.optimized**: 优化的Dockerfile，构建多阶段镜像
- **docker-compose.optimized.yml**: 使用命名卷的Docker Compose配置
- **docker-entrypoint.sh**: 容器入口点脚本，负责数据库初始化
- **init-db.js**: 初始化脚本，创建默认用户和分类

## 启动应用

```bash
# 使用优化配置启动
docker-compose -f docker-compose.optimized.yml up -d

# 查看日志
docker logs pocket-ledger

# 停止应用
docker-compose -f docker-compose.optimized.yml down

# 清除持久化数据(慎用)
docker-compose -f docker-compose.optimized.yml down -v
```

## 自定义默认账户

你可以通过修改`docker-compose.optimized.yml`文件中的环境变量来自定义默认用户名和密码：

```yaml
environment:
  # 自定义默认用户名和密码
  - DEFAULT_USERNAME=your_custom_username
  - DEFAULT_PASSWORD=your_custom_password
```

**注意**: 
- 更改默认账户后，需要删除已有的数据卷以便重新创建用户：
  ```bash
  docker-compose -f docker-compose.optimized.yml down -v
  ```
- 这只会影响初次创建的用户。如果数据库中已有用户，则这些设置不会生效。

## 默认设置

如果不修改环境变量，系统将使用以下默认设置：

- **默认用户名**: admin
- **默认密码**: admin123

## 默认分类

登录后，系统已预设了以下分类：

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

## 注意事项

- **重要**: 必须登录才能看到和使用默认分类
- 数据存储在Docker命名卷中，确保不要意外删除
- 应用运行在`http://localhost:3000`

## 故障排除

1. **分类不可见**: 确保您已经使用正确的账户密码登录系统
2. **数据库权限错误**: 容器内数据库权限已经配置正确
3. **容器无法启动**: 检查端口3000是否被占用
4. **自定义账户无效**: 确保在首次运行前设置环境变量并删除旧的数据卷

## 容器化亮点

1. **多阶段构建**: 减小最终镜像体积
2. **自动初始化**: 首次启动自动创建数据库和默认数据
3. **数据持久化**: 使用Docker命名卷确保数据持久化
4. **非root运行**: 增强安全性，使用普通用户运行应用
5. **环境变量支持**: 通过环境变量自定义默认用户

## 容器命令示例

```bash
# 查看数据库内容
docker exec pocket-ledger node /app/check-db.js

# 查看容器状态
docker ps -a | grep pocket-ledger