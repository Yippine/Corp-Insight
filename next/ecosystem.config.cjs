module.exports = {
  apps: [
    {
      name: 'corp-insight-next',
      script: 'npm',
      args: 'run dev',
      cwd: '/home/ec2-user/Corp-Insight/next',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        HOST: '0.0.0.0',
      },
      log_file: '/var/log/pm2/corp-insight-next.log',
      error_file: '/var/log/pm2/corp-insight-error-next.log',
      out_file: '/var/log/pm2/corp-insight-out-next.log',
      merge_logs: true,
      time: true,
    },
  ],
};
