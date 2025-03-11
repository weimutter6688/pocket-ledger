#!/bin/sh
set -e

# 打印执行信息
echo "Starting container initialization..."

# 检查prisma目录权限
ls -la /app/prisma

# 检查数据库文件是否存在
if [ ! -f /app/prisma/dev.db ]; then
    echo "Database file not found, creating..."
    
    # 运行prisma迁移命令创建数据库
    echo "Running database migrations..."
    npx prisma migrate deploy
    
    # 检查迁移是否成功
    if [ $? -eq 0 ]; then
        echo "Database migrations completed successfully."
    else
        echo "Database migrations failed! Exiting..."
        exit 1
    fi
    
    # 初始化默认用户和分类
    echo "Creating default user and categories..."
    node /app/init-db.js
    
    # 检查初始化是否成功
    if [ $? -eq 0 ]; then
        echo "Default data initialization completed successfully."
    else
        echo "Default data initialization failed but continuing..."
    fi
else
    echo "Database file exists, skipping initialization."
fi

# 确保数据库文件权限正确
if [ -f /app/prisma/dev.db ]; then
    echo "Setting correct permissions on database file..."
    chmod 664 /app/prisma/dev.db
    ls -la /app/prisma/dev.db
fi

# 输出启动信息
echo "Initialization complete, starting NextJS application..."

# 启动NextJS应用
exec npm start