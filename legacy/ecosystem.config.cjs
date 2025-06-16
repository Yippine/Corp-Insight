module.exports = {
  apps: [{
    name: 'business-magnifier-legacy',
    script: 'npm',
    args: 'run preview',
    cwd: '/home/ec2-user/Business-Magnifier/legacy',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 4173,
      HOST: '0.0.0.0'
    },
    log_file: '/var/log/pm2/business-magnifier-legacy.log',
    error_file: '/var/log/pm2/business-magnifier-error-legacy.log',
    out_file: '/var/log/pm2/business-magnifier-out-legacy.log',
    merge_logs: true,
    time: true
  }]
};