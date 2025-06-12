#!/bin/bash
# 讓腳本在發生錯誤時立即終止
set -e

# --- 組態設定 ---
TARGET_BRANCH="next"

# --- 輔助函式 ---
# 使用 echo 搭配 -e 來解析顏色代碼
function print_info() {
  echo -e "\e[34mℹ️  $1\e[0m"
}

function print_warning() {
  echo -e "\e[33m☢️  $1\e[0m"
}

function print_error() {
  echo -e "\e[31m❌ $1\e[0m" >&2
  exit 1
}

function print_success() {
  echo -e "\e[32m✅ $1\e[0m"
}

# --- 主腳本 ---
print_info "開始執行正式環境部署流程..."

# 1. 檢查目前分支
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "$TARGET_BRANCH" ]; then
  print_error "錯誤：目前不在 '$TARGET_BRANCH' 分支上。目前分支為 '$CURRENT_BRANCH'。部署中止。"
fi
print_info "檢查完畢：目前在 '$TARGET_BRANCH' 分支。"

# 2. 警告使用者此為破壞性操作
print_warning "此腳本將會捨棄所有本地變更 (已提交或未提交) 與未追蹤的檔案。"
print_warning "本地的 '$TARGET_BRANCH' 分支將會被強制重置以完全匹配 'origin/$TARGET_BRANCH'。"
echo "您有 5 秒鐘的時間可以按 Ctrl+C 取消操作..."
sleep 5

# 3. 清理工作目錄並重置到遠端狀態
print_info "正在清理工作目錄並重置到 origin/$TARGET_BRANCH..."
git fetch origin
git reset --hard "origin/$TARGET_BRANCH"
sudo git clean -fd
print_success "本地倉庫已成功清理並與 origin/$TARGET_BRANCH 同步。"

# 4. 重建並重啟正式環境容器
print_info "正在重建並重啟正式環境容器..."
if npm run docker:prod:rebuild; then
  print_success "正式環境部署成功！"
else
  print_error "在重建或啟動容器時發生錯誤，部署失敗。"
fi

exit 0