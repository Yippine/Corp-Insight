#!/bin/bash

# 創建時間戳
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "正在備份 AI Tools 資料..."
docker exec business-magnifier-mongo mongoexport \
  --host=localhost:27017 \
  --db=business-magnifier \
  --collection=ai_tools \
  --username=admin \
  --password=password \
  --authenticationDatabase=admin \
  --jsonArray \
  --pretty > db/backups/ai_tools_backup_$TIMESTAMP.json

if [ $? -eq 0 ]; then
    echo "AI Tools 備份完成！檔名：ai_tools_backup_$TIMESTAMP.json"
else
    echo "備份失敗！請檢查 Docker 容器是否正在運行。"
    exit 1
fi