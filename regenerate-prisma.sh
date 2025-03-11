#!/bin/bash
# 重新生成Prisma客户端

PROJ_DIR="/data/pocket-ledger"

echo "===== 重新生成Prisma客户端 ====="

# 进入项目目录
cd "$PROJ_DIR" || { echo "无法进入项目目录 $PROJ_DIR"; exit 1; }

# 显示当前Prisma版本
echo -e "\n当前Prisma版本:"
npx prisma --version

# 显示当前配置
echo -e "\n当前Prisma配置:"
cat prisma/schema.prisma

# 清除Prisma缓存
echo -e "\n清除Prisma缓存..."
rm -rf node_modules/.prisma

# 重新生成Prisma客户端
echo -e "\n重新生成Prisma客户端..."
npx prisma generate

# 检查是否生成成功
if [ $? -eq 0 ]; then
  echo "Prisma客户端生成成功"
else
  echo "Prisma客户端生成失败"
  exit 1
fi

# 执行数据库迁移
echo -e "\n执行数据库迁移确保模式最新..."
npx prisma migrate deploy

# 检查迁移是否成功
if [ $? -eq 0 ]; then
  echo "数据库迁移成功"
else
  echo "数据库迁移失败"
  exit 1
fi

echo -e "\n重启应用..."
echo "提示: 你需要手动重启应用以应用新的Prisma客户端"
echo "可以使用 'pm2 restart pocket-ledger-1' 命令重启应用"

echo -e "\n完成!"