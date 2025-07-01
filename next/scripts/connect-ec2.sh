#!/bin/bash

# --- connect-ec2.sh ---
# 使用 AWS Session Manager 安全地連線到生產環境的 EC2 實例。
# 此腳本會從 .env.production 檔案中讀取實例 ID。

# 設定環境變數檔案的路徑 (假設從專案根目錄執行)
ENV_FILE="./.env.production"

# 檢查 .env.production 檔案是否存在
if [ ! -f "$ENV_FILE" ]; then
    echo "🔴 錯誤：找不到生產環境設定檔：$ENV_FILE"
    echo "請建立該檔案並在其中加入 EC2_INSTANCE_ID 變數。"
    exit 1
fi

# 從 .env.production 檔案中讀取 EC2_INSTANCE_ID
# 此指令會提取 EC2_INSTANCE_ID 等號後的值，並移除可能存在的引號
EC2_INSTANCE_ID=$(grep 'EC2_INSTANCE_ID' "$ENV_FILE" | cut -d'=' -f2 | tr -d '"' | tr -d "'")

# 檢查實例 ID 是否為空
if [ -z "$EC2_INSTANCE_ID" ]; then
    echo "🔴 錯誤：在 $ENV_FILE 中找不到 EC2_INSTANCE_ID 或其值為空。"
    exit 1
fi

echo "✅ 成功讀取 EC2 實例 ID: $EC2_INSTANCE_ID"
echo "🚀 正在嘗試透過 AWS Session Manager 進行連線..."
echo "----------------------------------------------------"

# 執行 AWS Session Manager 連線指令
aws ssm start-session --target "$EC2_INSTANCE_ID"