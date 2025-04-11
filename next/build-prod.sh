#!/bin/bash

echo "===== 停止現有的 PM2 進程 ====="
pm2 stop all || true
pm2 delete all || true

echo "===== 安裝依賴 ====="
npm install

echo "===== 使用生產配置構建 ====="
# 備份原始配置
if [ -f ./next.config.js ]; then
  mv ./next.config.js ./next.config.js.bak
fi

# 使用生產配置
cp ./next.config.prod.js ./next.config.js

# 設置環境變數
export NEXT_PUBLIC_SKIP_BUILD_STATIC_GENERATION=true
export NEXT_DISABLE_PRERENDER_METHODS=1
export NEXT_TELEMETRY_DISABLED=1
export NODE_OPTIONS="--max_old_space_size=4096"

# 運行構建
echo "===== 運行優化的構建過程 ====="
npm run build

BUILD_SUCCESS=$?

# 還原原始配置
if [ -f ./next.config.js.bak ]; then
  mv ./next.config.js.bak ./next.config.js
fi

if [ $BUILD_SUCCESS -eq 0 ]; then
  echo "===== 構建成功，啟動生產服務 ====="
  pm2 start ecosystem.prod.config.cjs
  echo "===== 服務啟動完成 ====="
  pm2 save
  pm2 status
else
  echo "===== 構建失敗，回退到開發模式 ====="
  pm2 start ecosystem.config.cjs
  echo "===== 開發模式服務啟動完成 ====="
  pm2 save
  pm2 status
fi