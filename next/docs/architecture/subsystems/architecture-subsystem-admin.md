# 分解子系統圖（Mermaid 文字版）

說明：以下將系統拆解為多張子系統圖，涵蓋「認證/Auth」「後台/Admin」「Sitemap」「資料庫備份/還原」「郵件」「可觀測性/健康檢查」等。每張圖均延續既有 Docker 與程式結構，並強調和現有 /feedback、/admin/sitemap、/admin/database 的相容與復用。

---

## 2) 後台子系統（Admin/Root 儀表板 + Payload CMS）

```mermaid
flowchart LR
  subgraph AdminClient["Admin Client（Chrome/Edge）"]
    A["Admin / Root"]
  end

  subgraph NextApp["Next.js App"]
    ADMINUI["/admin/*（自研或整合）\n- Users 管理\n- Sitemap 控制\n- DB 管理"]
    ADMINAPI["/api/admin/*（RBAC、審核）"]
  end

  subgraph Payload["Payload CMS"]
    PUI["Payload Admin UI"]
    PCOLL["Collections（users/roles/...）"]
  end

  subgraph DB["MongoDB"]
    USERS["users"]
    AUD["audit_logs"]
    BK["backups（metadata）"]
  end

  A -->|登入後台| ADMINUI
  ADMINUI --> ADMINAPI

  ADMINUI -->|導向/嵌入| PUI
  PUI --> PCOLL
  PCOLL --> USERS

  ADMINAPI -->|CRUD users/roles\n（視需求部分交由 Payload）| USERS
  ADMINAPI -->|寫入操作紀錄| AUD
  ADMINAPI -->|備份清單/狀態| BK
```

重點：

- Admin UI 可選擇「整合 Payload UI」或「自建頁面」共存。
- RBAC 控管危險操作僅限特定權限（如 DB restore）。

---
