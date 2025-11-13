module.exports = {
  apps: [
    {
      name: "corp-insight-legacy",
      // 使用 npx 來執行 serve
      script: "npx",
      args: "serve -s . -l tcp://127.0.0.1:4173",

      // 執行目錄設置為 legacy
      cwd: "/mnt/c/Users/user/Documents/Yippine/Program/Corp-Insight/legacy",

      // 基本配置
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",

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
