module.exports = {
  apps: [{
    name: 'business-magnifier-v1',
    script: 'npm',
    args: 'run preview',
    cwd: '/home/ec2-user/Business-Magnifier-v1',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 4173,
      HOST: '0.0.0.0'
    },
    log_file: '/var/log/pm2/business-magnifier-v1.log',
    error_file: '/var/log/pm2/business-magnifier-error-v1.log',
    out_file: '/var/log/pm2/business-magnifier-out-v1.log',
    merge_logs: true,
    time: true
  }]
};