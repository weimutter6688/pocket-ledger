#!/bin/bash
# 修复数据库权限脚本

echo "===== 修复SQLite数据库权限 ====="

# 显示当前用户
echo "当前用户: $(whoami)"
echo "用户ID: $(id)"

# 显示现有权限
echo -e "\n当前数据库文件权限:"
ls -la /data/pocket-ledger/prisma/dev.db

# 修复权限 - 确保应用程序用户可以读写
echo -e "\n修复权限..."
sudo chmod 666 /data/pocket-ledger/prisma/dev.db
sudo chmod 777 /data/pocket-ledger/prisma

# 检查结果
echo -e "\n修复后权限:"
ls -la /data/pocket-ledger/prisma/dev.db
ls -ld /data/pocket-ledger/prisma

echo -e "\n完成!"