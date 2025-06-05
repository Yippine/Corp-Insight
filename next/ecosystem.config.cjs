module.exports = {
  apps: [
    {
      name: 'business-magnifier-v2',
      script: 'npm',
      args: 'run dev',
      cwd: '/home/ec2-user/Business-Magnifier-v2/next',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        HOST: '0.0.0.0',
      },
      log_file: '/var/log/pm2/business-magnifier-v2.log',
      error_file: '/var/log/pm2/business-magnifier-error-v2.log',
      out_file: '/var/log/pm2/business-magnifier-out-v2.log',
      merge_logs: true,
      time: true,
    },
  ],
};
