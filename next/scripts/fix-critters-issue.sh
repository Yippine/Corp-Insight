#!/bin/bash

echo "🔧 修復 critters 和 sitemap 衝突問題..."

echo "📦 1. 清理 npm 快取..."
npm cache clean --force

echo "📦 2. 重新安裝依賴..."
npm install

echo "🗺️ 3. 檢查 sitemap 衝突..."
if [ -f "public/sitemap.xml" ]; then
    echo "❌ 發現靜態 sitemap.xml 與動態路由衝突，已刪除"
    rm -f public/sitemap.xml
else
    echo "✅ 無 sitemap 衝突"
fi

echo "🐳 4. 停止現有 Docker 服務..."
docker-compose down --remove-orphans

echo "🐳 5. 清理 Docker 資源..."
docker system prune -f

echo "🐳 6. 重新建置 Docker 映像..."
docker-compose build app-dev --no-cache

echo "🐳 7. 啟動服務..."
docker-compose --profile dev up -d

echo "⏳ 8. 等待服務啟動..."
sleep 10

echo "🔍 9. 檢查服務狀態..."
docker-compose ps

echo "✅ 修復完成！"
echo "📝 請檢查以下連結："
echo "   - 首頁: http://localhost:3000"
echo "   - 動態 Sitemap: http://localhost:3000/sitemap.xml"
echo "   - Sitemap Index: http://localhost:3000/sitemap-index.xml"
echo "   - Robots.txt: http://localhost:3000/robots.txt"

echo "🛠️ 如果仍有問題，請運行: npm run fix:critters"