#!/bin/bash
# Script to add a git submodule to the references directory

# --- 修正路徑問題：確保在專案根目錄執行 Git 命令 ---
cd "$(dirname "$0")/../.."

# --- 參數檢查 ---
if [ "$#" -lt 1 ] || [ "$#" -gt 2 ]; then
  echo "❌ 錯誤：需要提供 1 或 2 個參數。"
  echo "用法 1 (自動偵測名稱): $0 <repository_url>"
  echo "用法 2 (手動指定名稱): $0 <repository_url> <project_name>"
  echo "範例: $0 https://github.com/user/repo.git"
  echo "範例: $0 https://github.com/user/repo.git my-repo"
  exit 1
fi

REPO_URL=$1

# --- 核心邏輯：參數處理 ---
if [ "$#" -eq 1 ]; then
  # 只有一個參數，從 URL 自動推斷專案名稱
  PROJECT_NAME=$(basename "$REPO_URL" .git)
  echo "ℹ️  未指定專案名稱，自動從 URL 推斷為: '$PROJECT_NAME'"
else
  # 有兩個參數，使用指定的專案名稱
  PROJECT_NAME=$2
fi

SUBMODULE_PATH="references/$PROJECT_NAME"

# --- 前置檢查 ---
# 檢查 submodule 是否已存在
if [ -d "$SUBMODULE_PATH" ]; then
  echo "⚠️  警告：目錄 '$SUBMODULE_PATH' 已存在。"
  read -p "您想繼續並嘗試將其初始化為 submodule 嗎？(y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "操作已取消。"
    exit 1
  fi
fi

# --- 核心邏輯 ---
echo "🚀 開始新增 submodule '$PROJECT_NAME'..."
echo "儲存庫 URL: $REPO_URL"
echo "目標路徑: $SUBMODULE_PATH"

# 使用 git submodule add 指令
git submodule add "$REPO_URL" "$SUBMODULE_PATH"

# --- 結果驗證 ---
if [ $? -eq 0 ]; then
  echo "✅ 成功新增 submodule '$PROJECT_NAME'。"
  echo "下一步建議："
  echo "1. 提交變更: git commit -m \"[submodule] add $PROJECT_NAME submodule\""
  echo "2. 推送變更: git push"
else
  echo "❌ 錯誤：新增 submodule 失敗。"
  echo "請檢查錯誤訊息、URL 和路徑是否正確。"
  exit 1
fi