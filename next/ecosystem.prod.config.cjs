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
      HOSTNAME: 'localhost',
      NEXT_PUBLIC_SKIP_BUILD_STATIC_GENERATION: 'true',
      NEXT_DISABLE_PRERENDER_METHODS: '1',
      NEXT_TELEMETRY_DISABLED: '1',
      // 增加內存限制以處理大型應用
      NODE_OPTIONS: '--max_old_space_size=4096'
    },
    log_file: '/var/log/pm2/business-magnifier-next-prod.log',
    error_file: '/var/log/pm2/business-magnifier-next-prod-error.log',
    out_file: '/var/log/pm2/business-magnifier-next-prod-out.log',
    merge_logs: true,
    time: true,
    // 增加啟動超時時間
    kill_timeout: 10000,
    wait_ready: true
  }]
};