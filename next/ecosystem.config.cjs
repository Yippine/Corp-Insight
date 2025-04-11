module.exports = {
  apps: [{
    name: 'business-magnifier-next',
    script: 'npm',
    args: 'run dev',
    cwd: './',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      PORT: 4173,
      HOST: '0.0.0.0',
      NEXT_PUBLIC_SKIP_BUILD_STATIC_GENERATION: 'true'
    },
    log_file: '/var/log/pm2/business-magnifier-next.log',
    error_file: '/var/log/pm2/business-magnifier-next-error.log',
    out_file: '/var/log/pm2/business-magnifier-next-out.log',
    merge_logs: true,
    time: true
  }]
};