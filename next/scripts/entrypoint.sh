#!/bin/bash
# 讓腳本在發生錯誤時立即終止
set -e

echo "🚀 執行應用程式啟動腳本 (以 Root 身份)..."

# --- 動態處理 Docker Socket 權限 ---
DOCKER_SOCKET=/var/run/docker.sock
if [ -S "$DOCKER_SOCKET" ]; then
    DOCKER_GID=$(stat -c '%g' $DOCKER_SOCKET)
    echo "🔧 偵測到 Docker Socket，主機 GID 為: $DOCKER_GID"
    
    # 檢查具有該 GID 的群組是否已存在
    if ! getent group $DOCKER_GID >/dev/null 2>&1; then
        echo "   - 正在建立 GID 為 $DOCKER_GID 的 'dockersock' 群組..."
        addgroup --gid $DOCKER_GID dockersock
    fi
    
    # 獲取與 GID 對應的群組名稱
    DOCKER_GROUP=$(getent group $DOCKER_GID | cut -d: -f1)
    
    # 將 nextjs 使用者加入該群組
    if ! id -nG "nextjs" | grep -qw "$DOCKER_GROUP"; then
        echo "   - 正在將使用者 'nextjs' 加入 '$DOCKER_GROUP' 群組..."
        adduser nextjs $DOCKER_GROUP
    else
        echo "   - 使用者 'nextjs' 已在 '$DOCKER_GROUP' 群組中。"
    fi
else
    echo "⚠️  未偵測到 Docker Socket，跳過 Docker 權限設定。"
fi
# --- 權限處理完畢 ---

echo "✅ MongoDB 已就緒。"

# 新增步驟: 修正掛載的 /app 目錄權限 (包含 /app/db 和 sitemap 狀態檔)
echo "🔧 正在修正 /app 的擁有者權限..."
chown -R nextjs:nodejs /app

# 步驟 2: 執行一次性的資料庫初始化/索引重建 (以 nextjs 使用者身份)
echo "🔧 正在執行資料庫初始化 (db:init)..."
gosu nextjs npm run db:init

# 步驟 3: 在背景啟動 Sitemap 監控器 (以 nextjs 使用者身份)
echo "📡 正在背景啟動 Sitemap 監控器 (sitemap:monitor)..."
gosu nextjs npm run sitemap:monitor &

# 步驟 3.5: 在背景啟動 API 金鑰每日重置排程 (以 nextjs 使用者身份)
echo "🔑 正在背景啟動 API 金鑰每日重置排程 (db:reset-keys)..."
gosu nextjs npm run db:reset-keys &

# 步驟 4: 執行傳遞給此腳本的主指令 (例如 "npm run dev" 或 "npm run start")
echo "🏁 啟動腳本執行完畢，正在以 'nextjs' 使用者身份啟動主應用程式..."
echo "----------------------------------------------------"

# 使用 gosu 切換到 nextjs 使用者，並執行主指令
# 這可以確保主應用程式以低權限運行，同時又能傳遞所有參數
exec gosu nextjs "$@"