module.exports = {
  apps: [
    {
      name: "corp-insight-legacy",
      // 直接指向 node_modules 中 serve 的執行檔
      script: "./node_modules/serve/build/main.js",

      // 指定 Node.js interpreter 路徑
      interpreter: "/home/leowu/.nvm/versions/node/v20.19.4/bin/node",

      // 傳遞給 serve 的參數
      args: "-s . -l tcp://127.0.0.1:4173",

      // 執行目錄設置為 legacy
      cwd: "/home/leowu/Yippine/Corp-Insight/legacy",

      // exec_mode 設為 'fork'
      // 這是管理單實例、非 Node.js 原生 cluster 應用的標準模式
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",

      // 環境變量
      env: {
        NODE_ENV: "production"
      },

      // 日誌配置
      error_file: "./logs/error.log",
      out_file: "./logs/out.log",
      log_file: "./logs/combined.log",
      time: true,
      merge_logs: true
    }
  ]
};
