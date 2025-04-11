#!/bin/bash

echo "===== 停止現有的 PM2 進程 ====="
pm2 stop all || true
pm2 delete all || true

echo "===== 安裝依賴 ====="
npm install

echo "===== 構建生產版本 ====="
NEXT_PUBLIC_SKIP_BUILD_STATIC_GENERATION=true npm run build

if [ $? -eq 0 ]; then
  echo "===== 構建成功，啟動生產服務 ====="
  pm2 start ecosystem.prod.config.cjs
else
  echo "===== 構建失敗，啟動開發模式 ====="
  pm2 start ecosystem.config.cjs
fi

echo "===== 服務啟動完成 ====="
pm2 status