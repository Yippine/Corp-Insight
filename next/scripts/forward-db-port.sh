#!/bin/bash

# --- forward-db-port.sh ---
# 建立一個到 EC2 實例的安全通訊埠轉發連線，以便存取 Mongo Express。
# 此腳本會從 .env.production 檔案中讀取實例 ID。

# 設定環境變數檔案的路徑 (假設從專案根目錄執行)
ENV_FILE="./.env.production"

# --- 設定 ---
# EC2 實例上 Mongo Express 正在運行的通訊埠
REMOTE_PORT="8081"
# 您本機上將被用來轉發的通訊埠
LOCAL_PORT="18081"

# 檢查 .env.production 檔案是否存在
if [ ! -f "$ENV_FILE" ]; then
    echo "🔴 錯誤：找不到生產環境設定檔：$ENV_FILE"
    echo "請建立該檔案並在其中加入 EC2_INSTANCE_ID 變數。"
    exit 1
fi

# 從 .env.production 檔案中讀取 EC2_INSTANCE_ID
EC2_INSTANCE_ID=$(grep 'EC2_INSTANCE_ID' "$ENV_FILE" | cut -d'=' -f2 | tr -d '"' | tr -d "'")

# 檢查實例 ID 是否為空
if [ -z "$EC2_INSTANCE_ID" ]; then
    echo "🔴 錯誤：在 $ENV_FILE 中找不到 EC2_INSTANCE_ID 或其值為空。"
    exit 1
fi

echo "✅ 成功讀取 EC2 實例 ID: $EC2_INSTANCE_ID"
echo "🚀 正在啟動安全通訊埠轉發..."
echo "----------------------------------------------------"
echo "🔒 本機通訊埠:  $LOCAL_PORT -> http://localhost:$LOCAL_PORT"
echo "🔗 遠端通訊埠: $REMOTE_PORT (在 EC2 上)"
echo "----------------------------------------------------"
echo "🟢 設定成功！您現在可以透過以下網址存取 Mongo Express："
echo "   http://localhost:$LOCAL_PORT"
echo "ℹ️  若要關閉連線，請在此終端機視窗按下 Ctrl+C。"

# 執行 AWS Session Manager 的通訊埠轉發指令
aws ssm start-session \
    --target "$EC2_INSTANCE_ID" \
    --document-name AWS-StartPortForwardingSession \
    --parameters "portNumber=$REMOTE_PORT,localPortNumber=$LOCAL_PORT"