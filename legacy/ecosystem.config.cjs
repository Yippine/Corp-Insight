module.exports = {
  apps: [
    {
      name: "corp-insight-legacy",
      script: "npm",
      args: "run preview",
      cwd: "/home/ec2-user/Corp-Insight/legacy",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 4173,
        HOST: "0.0.0.0",
      },
      log_file: "/var/log/pm2/corp-insight-legacy.log",
      error_file: "/var/log/pm2/corp-insight-error-legacy.log",
      out_file: "/var/log/pm2/corp-insight-out-legacy.log",
      merge_logs: true,
      time: true,
    },
  ],
};
