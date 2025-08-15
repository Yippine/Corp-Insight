# 分解子系統圖（Mermaid 文字版）

說明：以下將系統拆解為多張子系統圖，涵蓋「認證/Auth」「後台/Admin」「Sitemap」「資料庫備份/還原」「郵件」「可觀測性/健康檢查」等。每張圖均延續既有 Docker 與程式結構，並強調和現有 /feedback、/admin/sitemap、/admin/database 的相容與復用。

---

## 5) 郵件子系統（復用 /feedback 機制）

```mermaid
flowchart LR
  subgraph NextApp["Next.js App"]
    UTIL["Mail Util（與 /feedback 同一初始化）"]
    AUTHAPI["/api/auth/*（verify/reset 通知）"]
    ADMINAPI["/api/admin/*（管理通知，可選）"]
  end

  SMTP["SMTP Server（依 .env 與 /feedback 相同 keys）"]
  AUD["audit_logs（MongoDB）"]

  AUTHAPI -->|send verify/reset| UTIL
  ADMINAPI -->|send admin-notify（可選）| UTIL
  UTIL --> SMTP

  AUTHAPI -->|記錄 email flows| AUD
  ADMINAPI -->|記錄通知| AUD
```

重點：

- 不引入第二套寄信工具；所有寄信走同一 util 與 env keys。
- 模板與 token 生成策略沿用現有實作（或抽象成共用）。

---
