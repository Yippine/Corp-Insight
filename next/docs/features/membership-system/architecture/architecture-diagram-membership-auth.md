# 系統架構圖（Mermaid 文字版）

以下以 Mermaid 流程/元件圖描述整體系統（瀏覽器、Next.js App、NextAuth.js、Payload CMS、MongoDB、SMTP、容器/腳本）。若你需要 SVG 版本，我可以再輸出為 SVG Artifact。

```mermaid

flowchart LR
  subgraph "Client#40;Chrome #47; Edge#41;"
    A["使用者（前台）"]
    B["Admin #47; Root（後台）"]
  end

  subgraph "Next.js App（前端 #43; API Routes#47;BFF）"
    NA["NextAuth.js（OAuth, Credentials, Callbacks）"]
    API["#47;api#47;*（Auth, Admin, Sitemap, Database）"]
    UI["前端頁面（#47;auth, #47;admin#47;*）"]
    SCRIPTS["#47;app#47;scripts（db-backup.sh, healthcheck.js, entrypoint.sh）"]
  end

  subgraph "Payload CMS（Admin UI #38; Collections）"
    PUI["Payload Admin UI"]
    PCOLL["Collections（users, roles, ...）"]
  end

  subgraph "MongoDB（Docker, single-node Replica Set）"
    UCOLL["users #47; user_auth_providers #47; refresh_tokens #47; consents"]
    ALOG["audit_logs"]
    BKUP["backups（metadata）"]
  end

  subgraph "容器與周邊"
    DOCKER["Docker Compose（app-prod#47;app-dev#47;mongodb#47;mongo-express）"]
    MEXP["mongo-express（dev 工具）"]
  end

  SMTP["SMTP #47; Mail Server（以 #47;feedback 機制設定的相同環境變數）"]
  GOOGLE["Google OAuth（Provider）"]

  %% Client interactions
  A -->|"瀏覽#47;登入"| UI
  B -->|"後台操作"| UI

  %% Frontend to NextAuth / API
  UI --> NA
  UI --> API

  %% OAuth Flow
  NA -->|"Auth Request"| GOOGLE
  GOOGLE -->|"Callback (code)"| NA
  NA -->|"User Lookup#47;Create"| UCOLL
  NA -->|"Session#47;JWT"| UI

  %% Email flows
  API -->|"寄送驗證#47;重置信"| SMTP

  %% Admin flows
  API -->|"Sitemap 生成#47;查詢"| SCRIPTS
  API -->|"DB 備份#47;還原"| SCRIPTS

  %% Scripts to DB/FS
  SCRIPTS -->|"mongodump#47;mongorestore"| BKUP
  SCRIPTS -->|"備份檔案到 #47;app#47;db#47;backups"| DOCKER
  BKUP --> DB

  %% Payload CMS integration
  UI -->|"Admin 後台"| PUI
  PUI --> PCOLL
  PCOLL --> DB

  %% Observability / Tools
  DOCKER <-->|"容器網路#47;Volume"| UI
  DOCKER <-->|"容器網路#47;Volume"| DB
  DOCKER <-->|"（dev profile）"| MEXP

  %% Audit
  API -->|"寫入操作紀錄"| ALOG
  PUI -->|"管理操作紀錄"| ALOG

  %% Layout hints (optional to reduce crossings)
  classDef dim fill:#f6f6f6,stroke:#bbb,color:#333;
  classDef store fill:#eef7ff,stroke:#69c,color:#134;
  classDef action fill:#fffaf0,stroke:#e0b, color:#402;

  class UCOLL,BKUP,ALOG store
  class API,NA,SCRIPTS action
```

---

## 補充：資料流摘要

- 使用者登入（Google OAuth）：Client → NextAuth → Google → NextAuth Callback → 查/建 user（Mongo）→ 發放 Session/JWT。
- Email 驗證/重置：API 復用 /feedback 既有 mail util 與相同環境變數，寄送信件。
- 後台 Sitemap 與資料庫管理：Admin 操作 → API → 觸發容器內 scripts（sitemap 生成、mongodump/mongorestore）→ 更新 DB 與寫入 audit_logs。
- Payload CMS：作為後台 UI 與 Collections 定義，直接連接 MongoDB；與 Next.js App 共同存取 users 等資料。

---

## 相依與部署重點

- docker-compose profiles：dev（app-dev + mongo + mongo-express）、prod（app-prod + mongo）。
- Mongo 建議啟用 single-node replica set（./docker/mongodb/init/rs-init.js）。
- 備份路徑：/app/db/backups（權限控管、輪替策略）。
- 健康檢查：/api/health 回傳 DB 連線與應用狀態。
- 發信：務必沿用 /feedback 的 mail client 與環境變數（避免工具分裂）。
