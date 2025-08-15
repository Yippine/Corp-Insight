# 分解子系統圖（Mermaid 文字版）

說明：以下將系統拆解為多張子系統圖，涵蓋「認證/Auth」「後台/Admin」「Sitemap」「資料庫備份/還原」「郵件」「可觀測性/健康檢查」等。每張圖均延續既有 Docker 與程式結構，並強調和現有 /feedback、/admin/sitemap、/admin/database 的相容與復用。

---

## 4) 資料庫備份/還原子系統（/admin/database 相容）

```mermaid
flowchart LR
  subgraph AdminClient["Admin Client"]
    A["Admin（具備特別權限）"]
  end

  subgraph NextApp["Next.js App"]
    DBUI["/admin/database（既有/擴充）"]
    DBAPI["/api/admin/backups/*（create/list/download/restore）"]
    SCRIPTS["/app/scripts/db-*.sh（mongodump/mongorestore）"]
  end

  subgraph DB["MongoDB（Replica Set 建議）"]
    DATA["資料庫（corp-insight）"]
    BKCOLL["backups（metadata）"]
    AUD["audit_logs"]
  end

  BACKUPS["/app/db/backups/*.gz（容器內路徑）"]

  A -->|建立/列出/下載/還原| DBUI
  DBUI --> DBAPI

  DBAPI -->|建立備份| SCRIPTS
  SCRIPTS -->|mongodump| DATA
  SCRIPTS -->|輸出| BACKUPS

  DBAPI -->|寫入/更新備份資訊| BKCOLL
  DBAPI -->|記錄危險操作| AUD

  DBAPI -->|還原請求| SCRIPTS
  SCRIPTS -->|mongorestore（多重確認）| DATA
```

重點：

- Restore 為高風險 → 多重確認（輸入確認字串 + 二人審核可選）+ audit。
- 備份檔權限與輪替策略需設定；必要時加密。

---
