#!/bin/bash
# 检查和修复SQLite数据库文件

DB_PATH="/data/pocket-ledger/prisma/dev.db"
BACKUP_PATH="/data/pocket-ledger/prisma/dev.db.bak.$(date +%Y%m%d%H%M%S)"

echo "===== SQLite数据库检查与修复 ====="

# 备份数据库
echo "创建数据库备份: $BACKUP_PATH"
cp "$DB_PATH" "$BACKUP_PATH"
if [ $? -eq 0 ]; then
  echo "备份成功"
else
  echo "备份失败，可能没有足够权限"
fi

# 检查数据库完整性
echo -e "\n检查数据库完整性..."
sqlite3 "$DB_PATH" "PRAGMA integrity_check;"
if [ $? -eq 0 ]; then
  echo "数据库完整性检查通过"
else
  echo "数据库完整性检查失败"
fi

# 尝试恢复数据库
echo -e "\n尝试修复数据库..."
echo ".dump" | sqlite3 "$DB_PATH" > /tmp/dump.sql
if [ $? -eq 0 ]; then
  echo "数据库转储成功"
  
  # 创建新数据库
  echo "创建新数据库..."
  rm -f "$DB_PATH.new"
  cat /tmp/dump.sql | sqlite3 "$DB_PATH.new"
  
  if [ $? -eq 0 ]; then
    echo "新数据库创建成功"
    echo "替换原数据库..."
    mv "$DB_PATH.new" "$DB_PATH"
    chmod 666 "$DB_PATH"
    echo "数据库替换完成"
  else
    echo "新数据库创建失败"
  fi
else
  echo "数据库转储失败，无法修复"
fi

# 清理
rm -f /tmp/dump.sql

echo -e "\n完成!"