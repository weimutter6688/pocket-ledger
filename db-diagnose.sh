#!/bin/bash
# 数据库诊断脚本

echo "===== SQLite数据库诊断 ====="

# 检查进程信息
echo -e "\n进程信息:"
ps -ef | grep node

# 检查prisma目录
echo -e "\nPrisma目录权限检查:"
ls -la /data/pocket-ledger/prisma
echo "当前用户:"
whoami
id

# 检查数据库文件
echo -e "\n数据库文件检查:"
if [ -f /data/pocket-ledger/prisma/dev.db ]; then
  echo "数据库文件存在"
  ls -la /data/pocket-ledger/prisma/dev.db
  file /data/pocket-ledger/prisma/dev.db
else
  echo "数据库文件不存在"
fi

# 检查存储空间
echo -e "\n存储空间检查:"
df -h /data

# 检查.env文件中的数据库URL配置
echo -e "\n数据库URL配置检查:"
grep DATABASE_URL /data/pocket-ledger/.env

# 检查系统日志中的相关错误
echo -e "\n系统日志中的相关错误:"
journalctl -u pm2-pocket-ledger-1 --since "1 hour ago" | grep -i "error\|sqlite\|database\|prisma" | tail -20