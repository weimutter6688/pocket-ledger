#!/bin/bash
# 检查和修复数据库路径配置

ENV_FILE="/data/pocket-ledger/.env"
BACKUP_ENV="/data/pocket-ledger/.env.bak.$(date +%Y%m%d%H%M%S)"

echo "===== 数据库路径配置检查和修复 ====="

# 备份.env文件
echo "备份.env文件: $BACKUP_ENV"
cp "$ENV_FILE" "$BACKUP_ENV"

# 检查当前配置
echo -e "\n当前数据库URL配置:"
grep DATABASE_URL "$ENV_FILE"

# 检查数据库文件实际位置
echo -e "\n检查实际数据库文件位置:"
if [ -f "/data/pocket-ledger/prisma/dev.db" ]; then
  echo "数据库文件存在于: /data/pocket-ledger/prisma/dev.db"
  ACTUAL_PATH="/data/pocket-ledger/prisma/dev.db"
elif [ -f "/app/prisma/dev.db" ]; then
  echo "数据库文件存在于: /app/prisma/dev.db"
  ACTUAL_PATH="/app/prisma/dev.db"
else
  echo "无法找到数据库文件"
  exit 1
fi

# 调整.env文件中的数据库URL
echo -e "\n更新.env文件中的数据库URL..."
sed -i.bak "s|DATABASE_URL=.*|DATABASE_URL=\"file:${ACTUAL_PATH}\"|" "$ENV_FILE"

# 检查更新后的配置
echo -e "\n更新后的数据库URL配置:"
grep DATABASE_URL "$ENV_FILE"

echo -e "\n重启应用..."
echo "提示: 你需要手动重启应用以应用新配置"
echo "可以使用 'pm2 restart pocket-ledger-1' 命令重启应用"

echo -e "\n完成!"