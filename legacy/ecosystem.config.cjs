module.exports = {
  apps: [
    {
      name: "corp-insight-legacy",
      // 直接指向 node_modules 中 `serve` 的可執行檔
      script: "/home/ec2-user/Corp-Insight/legacy/node_modules/serve/build/main.js",

      // 添加 interpreter 屬性
      interpreter: "/home/ec2-user/.nvm/versions/node/v20.19.2/bin/node",

      // 傳遞給 serve 的參數
      args: "-s dist -l tcp://127.0.0.1:4173",

      // 確保執行目錄正確
      cwd: "/home/ec2-user/Corp-Insight/legacy",

      // exec_mode 設為 'fork'
      // 這是管理單實例、非 Node.js 原生 cluster 應用的標準模式
      exec_mode: "fork",

      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",

      // 日誌路徑保持不變
      log_file: "/var/log/pm2/corp-insight-legacy.log",
      error_file: "/var/log/pm2/corp-insight-error-legacy.log",
      out_file: "/var/log/pm2/corp-insight-out-legacy.log",
      merge_logs: true,
      time: true,
    },
  ],
};
