# 使用更小的基础镜像
FROM node:20-alpine

# 设置环境变量
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# 设置工作目录
WORKDIR /app

# 复制package.json文件
COPY package*.json ./

# 只安装生产依赖，用于运行而非构建
RUN npm config set ignore-scripts true && \
    npm ci --omit=dev && \
    npm cache clean --force

# 复制已构建的应用文件（假设您已在本地使用npm run build构建）
COPY .next ./.next
COPY public ./public
COPY prisma ./prisma
COPY next.config.ts ./
COPY next-env.d.ts ./

# 复制环境变量文件
COPY .env ./

# 生成Prisma客户端（这是唯一需要的"构建"步骤）
RUN npx prisma generate

# 减小镜像大小
RUN rm -rf /tmp/* && \
    rm -rf /var/cache/apk/* && \
    find /app -type d -name '.git' -exec rm -rf {} +

# 确保权限正确
RUN chown -R node:node /app

# 使用非root用户运行
USER node

# 暴露端口
EXPOSE 3000

# 启动应用（使用已构建的产物）
CMD ["npm", "start"]