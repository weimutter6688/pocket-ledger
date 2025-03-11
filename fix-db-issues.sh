#!/bin/bash
# 数据库问题综合修复脚本

echo "===== SQLite数据库问题诊断与修复 ====="
echo "此脚本将执行一系列步骤来诊断和修复数据库问题"

APP_DIR="/data/pocket-ledger"
DB_PATH="$APP_DIR/prisma/dev.db"
ENV_FILE="$APP_DIR/.env"

# 创建日志目录
mkdir -p "$APP_DIR/logs/db-fixes"
LOG_FILE="$APP_DIR/logs/db-fixes/fix-$(date +%Y%m%d%H%M%S).log"

# 记录日志函数
log() {
  echo "$1"
  echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

log "开始数据库问题诊断与修复过程"
log "日志文件: $LOG_FILE"

# 步骤1: 检查环境
log "\n步骤1: 检查环境"
log "当前用户: $(whoami)"
log "用户ID: $(id)"
log "Node版本: $(node -v)"
log "NPM版本: $(npm -v)"

# 检查数据库文件
if [ -f "$DB_PATH" ]; then
  log "数据库文件存在: $DB_PATH"
  log "文件大小: $(du -h "$DB_PATH" | awk '{print $1}')"
  log "文件权限: $(ls -la "$DB_PATH")"
else
  log "警告: 数据库文件不存在: $DB_PATH"
fi

# 检查环境变量
log "当前数据库URL配置:"
DB_URL=$(grep DATABASE_URL "$ENV_FILE" | cut -d= -f2-)
log "DATABASE_URL=$DB_URL"

# 步骤2: 修复数据库路径
log "\n步骤2: 修复数据库路径"
log "检查数据库URL是否正确指向数据库文件..."

# 备份.env文件
ENV_BAK="$ENV_FILE.bak.$(date +%Y%m%d%H%M%S)"
cp "$ENV_FILE" "$ENV_BAK"
log "已备份.env文件: $ENV_BAK"

# 更新数据库URL
CORRECT_PATH="file:$DB_PATH"
sed -i.tmp "s|DATABASE_URL=.*|DATABASE_URL=\"$CORRECT_PATH\"|" "$ENV_FILE"
log "已更新数据库URL为: $CORRECT_PATH"

# 步骤3: 修复文件权限
log "\n步骤3: 修复文件权限"
log "确保数据库文件和目录有正确的权限..."

# 确保prisma目录存在
mkdir -p "$APP_DIR/prisma"
log "确保prisma目录存在"

# 设置目录权限
chmod 777 "$APP_DIR/prisma"
log "为prisma目录设置777权限"

# 如果数据库文件存在，设置其权限
if [ -f "$DB_PATH" ]; then
  chmod 666 "$DB_PATH"
  log "为数据库文件设置666权限"
else
  log "数据库文件不存在，跳过文件权限设置"
fi

# 步骤4: 重新生成Prisma客户端
log "\n步骤4: 重新生成Prisma客户端"

# 进入项目目录
cd "$APP_DIR" || { log "无法进入项目目录 $APP_DIR"; exit 1; }

# 清除Prisma缓存
log "清除Prisma缓存..."
rm -rf node_modules/.prisma

# 重新生成Prisma客户端
log "重新生成Prisma客户端..."
npx prisma generate
if [ $? -eq 0 ]; then
  log "Prisma客户端生成成功"
else
  log "Prisma客户端生成失败，但继续执行"
fi

# 步骤5: 检查和尝试修复数据库
log "\n步骤5: 检查和尝试修复数据库"

# 只有当数据库文件存在时才尝试修复
if [ -f "$DB_PATH" ]; then
  # 备份数据库
  DB_BAK="$DB_PATH.bak.$(date +%Y%m%d%H%M%S)"
  cp "$DB_PATH" "$DB_BAK"
  log "已备份数据库: $DB_BAK"
  
  # 检查数据库完整性
  log "检查数据库完整性..."
  if command -v sqlite3 &> /dev/null; then
    INTEGRITY=$(sqlite3 "$DB_PATH" "PRAGMA integrity_check;" 2>&1)
    log "完整性检查结果: $INTEGRITY"
    
    if [ "$INTEGRITY" != "ok" ]; then
      log "数据库可能损坏，尝试修复..."
      
      # 尝试导出和重建
      sqlite3 "$DB_PATH" ".dump" > /tmp/db_dump.sql 2>> "$LOG_FILE"
      if [ $? -eq 0 ]; then
        log "数据库导出成功，尝试重建..."
        rm -f "$DB_PATH.new"
        sqlite3 "$DB_PATH.new" < /tmp/db_dump.sql 2>> "$LOG_FILE"
        
        if [ $? -eq 0 ]; then
          log "数据库重建成功，替换原数据库..."
          mv "$DB_PATH.new" "$DB_PATH"
          chmod 666 "$DB_PATH"
          log "数据库替换完成"
        else
          log "数据库重建失败"
        fi
      else
        log "数据库导出失败，无法修复"
      fi
      
      # 清理临时文件
      rm -f /tmp/db_dump.sql
    fi
  else
    log "sqlite3命令不可用，跳过数据库完整性检查"
  fi
else
  log "数据库文件不存在，跳过数据库修复"
fi

# 步骤6: 如果数据库不存在，尝试创建
if [ ! -f "$DB_PATH" ]; then
  log "\n步骤6: 数据库不存在，尝试创建"
  
  # 尝试运行迁移创建数据库
  log "运行Prisma迁移以创建数据库..."
  npx prisma migrate deploy
  
  if [ $? -eq 0 ]; then
    log "数据库创建成功"
    
    # 设置正确的权限
    chmod 666 "$DB_PATH"
    log "设置数据库文件权限为666"
    
    # 初始化默认数据
    log "初始化默认数据..."
    node "$APP_DIR/init-db.js"
  else
    log "数据库创建失败"
  fi
fi

# 总结
log "\n修复过程完成!"
log "请重启应用以应用更改: pm2 restart pocket-ledger-1"
log "如果问题仍然存在，请查看日志检查更详细的错误信息"

# 输出最终状态
log "\n最终状态:"
log "数据库文件状态: $(ls -la "$DB_PATH" 2>/dev/null || echo '文件不存在')"
log "数据库URL: $(grep DATABASE_URL "$ENV_FILE" | cut -d= -f2-)"

echo "完成! 详细日志: $LOG_FILE"
echo "请运行以下命令重启应用:"
echo "pm2 restart pocket-ledger-1"