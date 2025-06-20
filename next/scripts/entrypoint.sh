#!/bin/bash
# 讓腳本在發生錯誤時立即終止
set -e

echo "🚀 執行應用程式啟動腳本..."

# 步驟 1: 等待資料庫健康檢查通過
# (這一步驟現在由 docker-compose 的 depends_on.mongodb.condition: service_healthy 保證)
echo "✅ MongoDB 已就緒。"

# 步驟 2: 執行一次性的資料庫初始化/索引重建
echo "🔧 正在執行資料庫初始化 (db:init)..."
npm run db:init

# 步驟 3: 在背景啟動 Sitemap 監控器
echo "📡 正在背景啟動 Sitemap 監控器 (sitemap:monitor)..."
npm run sitemap:monitor &

# 步驟 4: 執行傳遞給此腳本的主指令 (例如 "npm run dev" 或 "npm run start")
echo "🏁 啟動腳本執行完畢，正在啟動主應用程式..."
echo "----------------------------------------------------"

# exec "$@" 會將當前 shell process 替換為 "$@" 指定的指令。
# 這是 Docker entrypoint 的最佳實踐，可以確保主程序能正確接收到終止信號 (如 Ctrl+C)。
exec "$@"