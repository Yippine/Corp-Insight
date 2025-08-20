# 專案文件 — 架構與設計（Architect Level）

適用範圍：在既有企業洞察平台上，建置第三方登入（Google 起步）、Email/password、會員管理、Admin 儀表板、Sitemap / Database 管理整合（Brownfield）。
技術要求：Payload CMS、NextAuth.js、Next.js（現有專案）、MongoDB (Docker)，全部套件需為 MIT 或 Apache-2.0 授權。

---

## 目錄

1. 系統目標與範圍
2. 系統邊界與使用案例
3. 高階架構拓撲（文字描述，含部署節點）
4. 核心組件與責任
5. 資料流（Auth、Signup、Backup/Restore、Sitemap）
6. 相容性檢查表（Concrete items from flattened-codebase.xml & Dockerfiles）
7. 部署與運維指引（含 Docker / Mongo replica set）
8. 安全 / 合規重點
9. 風險與緩解
10. 交付物與里程碑
11. 下一步行動（Architect 指令 / Developer Handoff）
12. 附錄：環境變數、重要檔案路徑與檔名建議

---

## 1. 系統目標與範圍

- 目標：在不改動現有主要流程與最小侵入的前提下，提供穩健的會員認證與管理系統，並將後台管理（Payload CMS）與認證（NextAuth.js）整合，實作 Google OAuth POC、Email 註冊/驗證、Admin 功能（含 DB 備份列舉與生成觸發）以及對 /admin/sitemap 與 /admin/database 的既有互動復用。
- 範圍：POC→MVP→逐步擴充 Facebook/Line、MFA、SSO 等。

---

## 2. 系統邊界與使用案例

邊界

- 內部：Next.js App (前端 + API routes)、Payload CMS、MongoDB（Docker）、/app/scripts（容器內工具）
- 外部：Google OAuth、(未來) Facebook、Line、SMTP 伺服器（由現有 /feedback 使用的 SMTP 配置提供）
- 禁止：不可使用付費 SaaS 資料庫（Atlas）或非 MIT/Apache 授權套件

主要使用案例

- UC1: 使用者以 Google 登入 -> 若 email 已驗證 -> 建立或綁定 user -> 回傳 session
- UC2: 使用者以 Google 登入但 provider 未提供 email -> 前端要求補填 email -> 寄驗證信 -> 驗證後綁定
- UC3: 使用者以 Email 註冊 -> 寄驗證信 -> 點擊驗證 -> 啟用帳號
- UC4: Admin 在 /admin/database 建立備份 -> 列舉 / 下載 / 還原（還原為高風險操作）
- UC5: Root 建立或撤銷 Admin 帳號、指派權限

---

## 3. 高階架構拓撲（部署節點/流程）

（文字拓撲）

- Client (Browser: Chrome/Edge) ↔ Next.js Frontend (App)
  - NextAuth.js client + Credentials + OAuth (Google)
  - Calls: /api/auth/_, /api/users/_, /api/admin/\*
- Next.js Backend (API routes / BFF)
  - NextAuth.js callbacks -> handle provider token exchange
  - Calls Payload CMS API (admin actions) 或直接操作 MongoDB for users collection as needed
  - Invokes scripts in /app/scripts for DB backup / sitemap generation
- Payload CMS (self-hosted)
  - Manages users, admin UI, content, RBAC (Payload collections map to Mongo)
- MongoDB (Docker; single-node replica set recommended)
  - stores users, auth providers, refresh_tokens, audit_logs, backups metadata
- SMTP (as configured in repo /feedback)
  - used to send verification / reset / notification emails

部署節點（Containers）

- app-prod (Next.js standalone) container
- mongodb container (mongo:7.0) configured as single-node replica set (for transactions)
- optional: mongo-express for dev (tools profile)
- scripts container / script execution within app-prod to write backups to /app/db/backups

---

## 4. 核心組件與責任

- NextAuth.js
  - 職責：OAuth流程、Credentials providers、Session/JWT策略、callback hooks
  - Integration point：/api/auth/\* routes；callback 需呼叫 user service
- Payload CMS
  - 職責：Admin UI、content & user collections、RBAC、Admin pages（sitemap/database 可整合）
- Auth Service (在 Next.js)
  - 職責：user lifecycle：create/merge user、issue tokens（access/refresh）、token rotation、email verification flow
- Mail util (共用)
  - 職責：寄發驗證信/重設/通知；必須與 /feedback 使用的實作相同
- Backup scripts (/app/scripts)
  - 職責：執行 mongodump / mongorestore 或自訂備份，寫入 backups collection，更新 UI
- Audit log collector
  - 職責：紀錄關鍵 admin 動作與安全事件

---

## 5. 資料流（示例）

A. OAuth 登入（Google）

1. Client -> /api/auth/signin/google (NextAuth initiates auth request)
2. Google -> callback -> /api/auth/callback/google
3. NextAuth callback -> fetch profile (email, email_verified)
   4a. If email_verified true -> lookup user by email
   - if exists: attach provider record to user_auth_providers
   - if not exists: create user with email_verified=true
     -> issue tokens (access JWT short-lived, set refresh cookie)
     4b. If no email / not verified -> create pending_social_registration, redirect client to /auth/complete-email
   - Client posts email -> server send verification email (reuse /feedback mail util)
   - After verification: create user and bind provider

B. Email Register

1. Client -> POST /api/auth/register
2. Server create user (email_verified=false) -> create verify token -> send mail via existing mail util
3. User clicks verify link -> GET /api/auth/verify-email -> set email_verified=true -> issue tokens

C. Backup create (Admin)

1. Admin triggers POST /api/admin/backups
2. Server invokes /app/scripts/db-backup.sh (mongodump -> /app/db/backups/<name>.gz)
3. On completion write backups doc to backups collection and audit_log
4. UI polls to show status

---

## 6. 相容性檢查表（根據你提供的 Dockerfile/docker-compose & flattened）

- Node / Next.js
  - Dockerfile uses node:21-bullseye-slim — OK for Node 21 runtime; ensure Next.js version compatible (Next.js 14+ recommended)
- MongoDB
  - docker-compose uses mongo:7.0 — supports transactions with replica set; must init replSet in init script
  - Check volume mounts: docker-compose maps ./docker/mongodb/init to /docker-entrypoint-initdb.d — place replSet init script here (e.g., rs-init.js)
- Scripts & backups
  - Dockerfile already creates /app/db/backups and marks /app/scripts executable — ensure backup scripts exist and are used by Admin UI
- Mail system
  - Use same env keys and mail client as /feedback — Agent must extract exact env keys from flattened-codebase.xml and reuse
- Entrypoint & root user init
  - Dockerfile copies .env.production — avoid embedding sensitive secrets in image; set ROOT creds via env and create at first boot
- Healthcheck
  - Ensure /api/health returns DB ping and service ok for Docker healthchecks (healthcheck used in compose for depends_on)
- SSE & JWT
  - Project has SSE implemented — ensure NextAuth session strategy doesn’t conflict; use JWT for access tokens, refresh token stored server-side

Checklist actions for integration

- [ ] Extract /feedback mail client init code and env keys
- [ ] Create mongo replset init in ./docker/mongodb/init (rs.initiate())
- [ ] Add entrypoint logic to create Root user from env if missing
- [ ] Ensure NextAuth config uses credentials provider + google provider and reuses mail util for verification emails
- [ ] Ensure scripts invoked by admin UI exist and are executable in container

---

## 7. 部署與運維指引（簡要）

- Docker-compose profiles:
  - dev: app-dev + mongodb + mongo-express
  - prod: app-prod + mongodb
- Mongo replica set init (single-node):
  - Add ./docker/mongodb/init/rs-init.js with:
    - rs.initiate({\_id: "rs0", members: [{ _id: 0, host: "mongodb:27017" }]})
  - Ensure mongodb container mounts the init scripts (docker-compose already maps init dir)
- Root creation
  - entrypoint.sh should check DB for root user; if not present, create with credentials from env ROOT_USERNAME/ROOT_PASSWORD and log first-login requirement
- Backups
  - Backups stored in /app/db/backups; consider scheduled rotation and retention policy (e.g., keep last 30)
  - Secure backups (filesystem permissions) and preferably encrypt backups at rest (GPG) — if not possible now, document risks
- Secrets
  - Use environment variables; rotate JWT_SECRET and OAuth client secrets regularly; avoid committing in repo
- Monitoring
  - Expose /metrics or integrate simple logging; plan for future integration with Prometheus/Grafana

---

## 8. 安全 / 合規（要點回顧）

- OAuth with PKCE, state, nonce
- Token rotation and server-side refresh token store
- CSRF protection for cookie-based flows
- Email verification mandatory for account enablement
- Backup/restore as privileged actions with audit trail
- Data deletion / anonymization workflow for compliance

---

## 9. 風險與緩解（重點）

- 資料遺失風險於還原操作 -> require multi-step confirmation + dry-run option
- 發信機制不同導致 deliverability 問題 -> force reuse existing /feedback mail util
- Provider email absent (Line) -> pending registration flow + mandatory email capture

---

## 10. 交付物與里程碑（Architect handoff）

短期交付（POC）

- Extracted mail util & env keys (from flattened) — done if requested
- NextAuth.js + minimal Payload integration scaffold (POC)
- Mongo replset init script & docker-compose adjustments
- Admin UI: user list, basic backup create/list (restore excluded for POC)

中期交付（MVP）

- Full Email verify and forgot password
- Refresh token rotation & revocation
- Admin full backup/restore with audit
- Sitemap integration and triggers

長期交付

- Facebook/Line providers, MFA, SSO for enterprise

---

## 11. 下一步行動（Architect 指令 / Developer Handoff）

優先事項（立刻執行）

1. Agent: 從 flattened-codebase.xml 取出 /feedback 的 mail 初始化函式與 env keys，加入到 shared mail util（避免複製錯誤）。—— _Status: Dev-Note created_
2. Agent: 新增 ./docker/mongodb/init/rs-init.js 並確認 docker-compose volume mount 能執行（測試容器啟動行為）。
3. Dev: 修改 entrypoint.sh 以檢測 user collection 並建立 Root（從 env 提取），同時在第一次登入要求強制變更密碼。
4. Dev: 實作 NextAuth.js Google provider 與 Credentials provider，並撰寫 callback hook 用以 create/merge user，以及在 provider 未提供 email 的情況下建立 pending_social_registration。
5. QA: 設計 E2E 測試用例（OAuth flow、email verify、backup create/list）

---

## 12. 附錄：環境變數 & 檔案命名建議

推薦檔名與位置

- docs/prd/brownfield-prd-membership-auth.md
- docs/dev-notes/dev-note-extracted-from-flattened.md
- docker/mongodb/init/rs-init.js
- scripts/entrypoint.sh (修改以建立 Root)
- scripts/db-backup.sh (若尚未存在)
- .env.example (列出所有必要 env keys)

核心 env keys（請以 flattened-codebase.xml / docker-compose 為最終準則）

- MONGODB_URI / MONGO_INITDB_ROOT_USERNAME / MONGO_INITDB_ROOT_PASSWORD
- NEXT_PUBLIC_SITE_URL
- JWT_SECRET
- ROOT_USERNAME / ROOT_PASSWORD
- SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS / MAIL_FROM (由 /feedback 確認)
- NEXTAUTH_URL / NEXTAUTH_SECRET
- OAUTH_GOOGLE_CLIENT_ID / OAUTH_GOOGLE_CLIENT_SECRET
- (future) OAUTH_FACEBOOK_CLIENT_ID / OAUTH_FACEBOOK_CLIENT_SECRET

---

如需我把上述文字轉為可視化架構圖（Mermaid 或 SVG），或直接產出 repo-ready scaffold（NextAuth config, Payload schema, docker-compose 修正、rs-init.js、entrypoint.sh 範例），請回覆對應指令：

- "\*export-architecture-diagram-mermaid"（產出 mermaid flow）
- "\*scaffold-repo-files"（產出 NextAuth + Payload minimal scaffold + docker init scripts）
- "\*generate-entrypoint-root-init"（只產出 entrypoint.sh 範例與 Root 建立腳本）
