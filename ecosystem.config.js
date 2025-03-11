module.exports = {
  apps: [
    {
      name: 'pocket-ledger',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      instances: 'max', // 根据CPU核心数自动扩展
      exec_mode: 'cluster', // 集群模式
      watch: false, // 不启用文件监视
      max_memory_restart: '1G', // 内存超过1G时自动重启
      env: {
        NODE_ENV: 'production',
        PORT: 3000, // 生产环境端口，可以修改此处更改端口
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 3000, // 开发环境端口，可以修改此处更改端口
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: 'logs/error.log',
      out_file: 'logs/out.log',
      merge_logs: true,
      // 优雅关闭
      kill_timeout: 5000, // 给进程5秒时间来处理请求
      wait_ready: true, // 等待应用准备就绪信号
      listen_timeout: 10000, // 等待应用监听端口的超时时间
    },
  ],

  // 部署配置
  deploy: {
    production: {
      user: 'user',
      host: 'host_ip',
      ref: 'origin/main',
      repo: 'git_repository_url',
      path: '/var/www/pocket-ledger',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
    },
  },
};