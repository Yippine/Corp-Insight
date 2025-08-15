# 分解子系統圖（Mermaid 文字版）

說明：以下將系統拆解為多張子系統圖，涵蓋「認證/Auth」「後台/Admin」「Sitemap」「資料庫備份/還原」「郵件」「可觀測性/健康檢查」等。每張圖均延續既有 Docker 與程式結構，並強調和現有 /feedback、/admin/sitemap、/admin/database 的相容與復用。

---

## 1) 認證子系統（NextAuth + Users + Providers + Email 驗證）

```mermaid

flowchart LR
  subgraph "Client#40;Chrome#47;Edge#41;"
    U["User"]
  end

  subgraph "Next.js App"
    NA["NextAuth.js#10;Providers: Google, Credentials"]
    AUTHAPI["#47;api#47;auth#47;*（register, verify, login, reset, refresh）"]
    UTIL["Mail Util（復用 #47;feedback）"]
  end

  GOOGLE["Google OAuth"]
  SMTP["SMTP（依 #47;feedback 環境變數）"]

  subgraph "MongoDB（Replica Set 建議）"
    USERS["users"]
    UAP["user_auth_providers"]
    RTOK["refresh_tokens"]
    PEND["pending_social_registrations"]
    AUD["audit_logs"]
  end

  %% Client -> App
  U -->|"Sign in #47; Register"| NA
  U -->|"Email flows UI"| AUTHAPI

  %% OAuth
  NA -->|"Auth Request"| GOOGLE
  GOOGLE -->|"Callback (code)"| NA

  %% Persistence
  NA -->|"User lookup#create#10;綁定 provider"| USERS
  NA -->|"新增 provider 記錄"| UAP
  AUTHAPI -->|"create#47;rotate"| RTOK
  AUTHAPI -->|"pending social"| PEND

  %% Email
  AUTHAPI -->|"寄送驗證#47;重置信"| UTIL
  UTIL --> SMTP

  %% Audit
  NA -->|"記錄登入成功#47;失敗"| AUD
  AUTHAPI -->|"記錄驗證#47;重設事件"| AUD
```

重點：

- Access JWT 短存活（建議 15 分鐘）、Refresh Token 存 DB hash（旋轉 + 撤銷）。
- Provider 未提供 email → 進入 pending_social_registrations 並要求補信箱完成驗證。

---
