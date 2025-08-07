module.exports = {
  apps: [
    {
      name: 'corp-insight-next',

      // 關鍵修正 1: 直接指向 Next.js 的可執行檔
      // 這比用 'next' 這個字串更可靠，避免了 PATH 問題
      script: '/home/ec2-user/Corp-Insight/next/node_modules/next/dist/bin/next',

      // 關鍵修正 2: 執行 'start' 指令，並指定 port
      args: 'start -p 3000',

      cwd: '/home/ec2-user/Corp-Insight/next',

      // 關鍵修正 3: 指定 Node.js 直譯器的絕對路徑
      // 請用 `which node` 確認你的實際路徑
      interpreter: '/home/ec2-user/.nvm/versions/node/v20.19.2/bin/node',

      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',

      // 關鍵修正 4: 絕對、絕對要設為 'production'
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },

      log_file: '/var/log/pm2/corp-insight-next.log',
      error_file: '/var/log/pm2/corp-insight-error-next.log',
      out_file: '/var/log/pm2/corp-insight-out-next.log',
      merge_logs: true,
      time: true,
    },
  ],
};
