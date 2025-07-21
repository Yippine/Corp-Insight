#!/bin/bash

# 函式：印出分隔線，用於視覺化區分區塊
print_separator() {
  printf -- '-%.0s' {1..60}
  printf '\n'
}

# --- Git 狀態檢查 ---
echo "🚀  正在執行：git status"
print_separator
git status
printf '\n\n'

# --- Git 分支檢查 ---
echo "🌿  正在執行：git branch"
print_separator
git branch
printf '\n\n'

# --- Git 提交紀錄 (使用自訂別名 'lg') ---
echo "📜  正在執行：git lg -5"
print_separator
git lg -5
printf '\n'