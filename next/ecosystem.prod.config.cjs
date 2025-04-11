module.exports = {
  apps: [{
    name: 'business-magnifier-next-prod',
    script: 'node',
    args: './.next/standalone/server.js',  // 使用獨立伺服器模式啟動
    cwd: './',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 4173,
      HOST: '0.0.0.0',
      HOSTNAME: 'localhost'
    },
    log_file: '/var/log/pm2/business-magnifier-next-prod.log',
    error_file: '/var/log/pm2/business-magnifier-next-prod-error.log',
    out_file: '/var/log/pm2/business-magnifier-next-prod-out.log',
    merge_logs: true,
    time: true
  }]
};