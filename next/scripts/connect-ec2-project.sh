#!/bin/bash

# --- connect-ec2-project.sh ---
# 使用 AWS Session Manager 直接連線到生產環境 EC2，並自動切換至專案目錄。
# 這種方法不需要管理本地 SSH 私鑰，更為便捷和安全。
# 此腳本會從 .env.production 檔案中讀取實例 ID。

# 設定環境變數檔案的路徑
ENV_FILE="./.env.production"

# --- 設定 ---
# 專案在 EC2 上的絕對路徑
PROJECT_DIR="/home/ec2-user/Business-Magnifier/next"

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
echo "🚀 正在透過 Session Manager 直接連線並切換至專案目錄..."
echo "----------------------------------------------------"

# 使用 AWS CLI 的 start-session 功能
# --target 指定要連線的實例
# --document-name 指定要執行的 SSM 文件，AWS-StartInteractiveCommand 允許我們傳遞命令
# --parameters command="..." 指定在 EC2 實例上要執行的命令
# 命令內容：以 ec2-user 的身份，切換到專案目錄，然後啟動一個新的 bash 登入 shell 讓我們操作。
# 這裡的引號比較複雜：
# - 最外層的 "..." 是給 aws 指令的參數。
# - 內層的 [\"...\"] 是 JSON 陣列的格式。
# - 更內層的 \\\"...\\\" 是為了讓 bash -c 接收一個完整的字串，其中 $PROJECT_DIR 會被本地 shell 替換。
aws ssm start-session \
    --target "$EC2_INSTANCE_ID" \
    --document-name "AWS-StartInteractiveCommand" \
    --parameters "command=[\"sudo -u ec2-user -i bash -c \\\"cd $PROJECT_DIR && exec bash -l\\\"\"]"

echo "----------------------------------------------------"
echo "✅ 連線已結束。"