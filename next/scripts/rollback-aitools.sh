#!/bin/bash
# Rollback script for AI Tools domain separation

echo "=== 開始回滾 AI Tools 域名設置 ==="
echo "時間: $(date)"

# 1. 恢復 Nginx 配置
echo "Step 1: 恢復 Nginx 配置..."
BACKUP_FILE=$(ls -t /etc/nginx/conf.d/_leopilot_master.conf.backup-* 2>/dev/null | head -1)
if [ -f "$BACKUP_FILE" ]; then
    sudo cp "$BACKUP_FILE" /etc/nginx/conf.d/_leopilot_master.conf
    echo "✓ 已恢復 Nginx 配置從: $BACKUP_FILE"
else
    echo "✗ 找不到備份檔案！"
    exit 1
fi

# 移除新的 aitools 配置
sudo rm -f /etc/nginx/conf.d/aitools.conf
sudo rm -f /etc/nginx/conf.d/aitools_test.conf
echo "✓ 已移除 aitools 配置"

# 重載 Nginx
sudo nginx -t && sudo nginx -s reload
echo "✓ Nginx 已重載"

# 2. 恢復應用程式碼
echo "Step 2: 恢復應用程式碼..."
cd /home/ec2-user/Corp-Insight

# 儲存當前變更（如果有）
git stash save "Rollback: Stashing changes before rollback"

# 切換回主分支
git checkout main
git pull origin main

# 刪除功能分支
git branch -D feature/aitools-domain-separation 2>/dev/null

echo "✓ 程式碼已恢復到主分支"

# 3. 重啟應用
echo "Step 3: 重啟應用..."
cd next
npm run reset:prod

echo "=== 回滾完成！==="
echo "請檢查以下項目："
echo "1. 網站是否正常訪問: https://corpinsight.leopilot.com"
echo "2. Docker 容器狀態: docker ps"
echo "3. Nginx 錯誤日誌: sudo tail -f /var/log/nginx/error.log"
