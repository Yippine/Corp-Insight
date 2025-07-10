#!/bin/bash
# Script to safely remove a git submodule from the references directory

# --- 修正路徑問題：確保在專案根目錄執行 Git 命令 ---
# Git Submodule 的設定檔 (.gitmodules) 和 Git 的核心目錄 (.git) 位於專案根目錄
# 而此腳本是從 /next/scripts 被呼叫，所以需要先回到上層
cd "$(dirname "$0")/../.."

# --- 參數檢查 ---
if [ "$#" -ne 1 ]; then
  echo "❌ 錯誤：需要提供要移除的 submodule 專案名稱。"
  echo "用法: $0 <project_name>"
  echo "範例: $0 my-repo"
  exit 1
fi

PROJECT_NAME=$1
SUBMODULE_PATH="references/$PROJECT_NAME"
GIT_MODULE_PATH=".git/modules/$SUBMODULE_PATH"

# --- 前置檢查 ---
# 檢查 submodule 路徑是否存在
if [ ! -d "$SUBMODULE_PATH" ] && [ ! -f ".gitmodules" ] || ! grep -q "path = $SUBMODULE_PATH" ".gitmodules"; then
  echo "❌ 錯誤：找不到名為 '$PROJECT_NAME' 的 submodule 或其設定。"
  echo "請檢查專案名稱是否正確，或 submodule 是否已被移除。"
  exit 1
fi

echo "⚠️  警告：您即將永久移除 submodule '$PROJECT_NAME'。"
echo "此操作包含以下步驟："
echo "1. 取消初始化 Submodule: git submodule deinit -f $SUBMODULE_PATH"
echo "2. 從 Git 追蹤中移除: git rm -f $SUBMODULE_PATH"
echo "3. 清理 .git 內部目錄: rm -rf $GIT_MODULE_PATH"
read -p "您確定要繼續嗎？(y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "操作已取消。"
  exit 0
fi


# --- 核心邏輯 ---
echo "🚀 開始移除 submodule '$PROJECT_NAME'..."

# 步驟 1: De-initialize a submodule，強制執行 (-f) 以避免工作目錄有修改時的錯誤
git submodule deinit -f "$SUBMODULE_PATH"

# 步驟 2: 移除 submodule 的 Git 追蹤，強制執行 (-f)
git rm -f "$SUBMODULE_PATH"

# 步驟 3: (可選但建議) 清理 .git 目錄下的 submodule 殘餘
# git rm 通常會處理這個，但手動清理更保險
if [ -d "$GIT_MODULE_PATH" ]; then
    echo "🧹 清理殘餘的 .git 目錄: $GIT_MODULE_PATH"
    rm -rf "$GIT_MODULE_PATH"
fi

# --- 結果驗證 ---
if [ $? -eq 0 ]; then
  echo "✅ 成功移除 submodule '$PROJECT_NAME'。"
  echo "下一步建議："
  echo "1. 提交變更: git commit -m \"[submodule] remove $PROJECT_NAME submodule\""
  echo "2. 推送變更: git push"
else
  echo "❌ 錯誤：移除 submodule 失敗。"
  echo "請檢查錯誤訊息或手動執行以上指令進行除錯。"
  exit 1
fi