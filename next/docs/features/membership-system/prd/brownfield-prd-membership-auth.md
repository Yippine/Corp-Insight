
# Brownfield PRD — 第三方登入與會員管理系統
適用專案：企業洞察平台（既有 flattened-codebase.xml / Next.js 專案）  
技術栈要求：Payload CMS + NextAuth.js 為核心；所有額外套件採用 MIT 或 Apache-2.0 授權之開源軟體。  
輸出語言：繁體中文（臺灣用語）

---

## 1. 專案摘要與目標
目標：於既有企業洞察平台內（Brownfield）新增「第三方登入（Google → Facebook, Line）與會員管理系統」，整合 Payload CMS 作為後台內容/會員資料管理介面、使用 NextAuth.js 處理 OAuth 與本地登入，沿用現有 MongoDB（Docker 化）與 JWT 機制，最小侵入現有程式碼，採迭代方式以 PoC → MVP → 擴充。

成功指標（KPI）
- Google 第三方登入完成並穩定運作（POC 阶段）：功能正確率 ≥ 98%（回調 / 驗證流程）
- Email 驗證信啟用：註冊後完成驗證率 ≥ 95%
- Admin 後台能列出會員、搜尋、禁用/啟用帳號並查看登入記錄
- 後台能啟動/檢視 MongoDB 備份/還原（需權限控管與操作審核）
- CI/CD / 部署：容器化支援，與現有 Dockerfile/docker-compose 相容

範圍（MVP）
- Google OAuth + Email/密碼註冊與驗證信、忘記密碼
- Payload CMS 作為 Admin 介面（整合 users collection 與 provider 綁定）
- NextAuth.js 作為認證中介，發放 access JWT（短期）與 server-side refresh token（儲存在 DB）
- 後台會員儀表板（基礎統計）與 /admin/sitemap、/admin/database 類似的控制頁面（列入風險提示與按鈕慎權）
- 符合你專案現有發信機制（參考 /feedback 使用相同工具與環境變數）

---

## 2. 前提與限制（Brownfield）
- 必須使用 Payload CMS + NextAuth.js。
- 其餘套件或工具需為 MIT 或 Apache-2.0 授權之 OSS。
- 現有 DB：MongoDB（Docker 容器）。不可使用付費 SaaS（如 Atlas）或非授權套件。
- 瀏覽器支援：Edge（Chromium-based 最近兩版）、Chrome（最近兩版）。
- Root 初始帳號：預設 leosys / 01517124；PRD 建議以環境變數初始化並於首次登入強制變更密碼。
- 發信：請以專案既有 /feedback 實作機制為準（不另外引入 MailHog 除非為 local dev；PRD 會檢視現有程式碼使用的 mail library 和 env 變數並比照實作）。

---

## 3. 核心使用者與角色
- Root (後台)
  - 唯一使用者，初始化存在。能 CRUD Admin 帳號並分派權限（最高權限）。
- Admin (後台)
  - 檢視後台儀表板、會員管理、Sitemap 與 Database 操作介面（危險操作需二次確認與審核）。
- User (前台)
  - Free / Pro（先分級不實作付費機制）
  - 可用 Email/密碼 或 第三方（Google 先行）
  - 必須完成 email 驗證才能啟用會員功能
- System / Auditor
  - 用於記錄 audit logs、備份活動記錄

備註：前/後台帳號體系建議分離（不同 collections 或 role flag），但仍可讓 Admin 以 members 管理前台使用者。

---

## 4. 功能需求（詳細）
重要：feature.xml 的所有功能須納入（你已上傳），此 PRD 以該檔為基準並補充實作細節、相容性建議與優先順序。

4.1 第三方登入（核心）
- Provider：Google（POC）→ 成功後再接 Facebook、Line。
- Flow：Authorization Code Flow with PKCE（前端為 SPA / Next.js，後端 BFF 使用 NextAuth.js 提供 callback 與 session 管理）。
- Callback 處理：
  - 驗證 state + nonce。
  - 取得 provider profile（含 email, email_verified）。
  - 若 email 存在且 provider 已驗證 email：
    - 若已存在 user（email 相同）則在 user_auth_providers 新增 provider 紀錄（綁定）。
    - 若不存在 user，建立 user（email_verified = true）。
  - 若 provider 未提供或未驗證 email（如某些 Line 情況）：
    - 建立 pending_social_registration（暫存資料），前端要求使用者補填 email，寄出驗證信並在驗證後完成綁定。
- 必須符合 NextAuth.js 授權流程與 Payload CMS 檔案權限。

4.2 Email / 密碼註冊、驗證信、忘記密碼
- 註冊流程：
  - POST /auth/register（由 NextAuth / custom API 端點處理）
  - 建 user（email_verified = false），寄發驗證信（參考 /feedback pattern）
  - 驗證連結 -> GET /auth/verify-email?token=... -> 將 email_verified 設為 true，發放 tokens 或 redirect 登入
- 忘記密碼：
  - POST /auth/forgot -> 寄發重置連結
  - GET /auth/reset?token -> 允許重設密碼（驗證 token 過期策略）

4.3 帳號合併策略（採業界最佳實務）
- 以 email 為主鍵（唯一 index）。
- 若 provider 回傳已驗證的 email，則自動嘗試與該 email 的現有 user 合併（將 provider 資訊寫入 user_auth_providers）。
- 若 provider email 未驗證或未提供，則暫不自動合併，要求使用者補填 email 並完成驗證再綁定。
- 若使用者以不同 email 使用多 provider 登入，視為不同帳號（需使用者主動合併申請，後續提供 UI + 驗證流程）。

4.4 權限與 Admin 管理
- Root（初始化）能建立/刪除/修改 Admin 帳號與其權限（權限例：查看、編輯、執行危險操作）。
- Admin 能查看：
  - /admin/users 列表（搜尋、過濾、分頁）
  - 單一 user detail（含 auth provider 綁定、登入紀錄、consents）
  - Member usage 儀表板（DAU、註冊數、登入失敗率）
  - /admin/sitemap（比照現有頁面）
  - /admin/database（比照現有頁面）包含備份/還原，但需權限與額外確認（danger operations）
- Admin 的危險操作（如 DB restore 或永久刪除）需：
  - 顯示多重確認（type 操作字串、輸入確認碼）
  - 寫入 audit_log，並可由 Root 追蹤與回溯

4.5 備份 / 還原 儀表板（MongoDB）
- 在後台新增「Database 管理」頁面或整合現有 /admin/database。
- 功能：
  - 建立備份（trigger mongodump 或 snapshot）：指定名稱、描述、包含 collections、是否包含敏感欄位
  - 列出備份清單（time, size, created_by, checksum）
  - 還原備份（danger 操作）：需 Admin 權限 + 二次確認 + 審核 log
  - 下載備份（受權限控制）
- 重要：備份檔應存放於 /app/db/backups（Dockerfile 已預留），但上傳或外洩風險需管控（建議限制存取與加密）
- 在 PRD 中會註明：把 /admin/database 的現有互動邏輯與按鈕細節列入開發 Agent 注意清單（必須直接參考現有頁面實作細節以避免工具混亂）

4.6 Sitemap 管理儀表板
- 與現有 /admin/sitemap 頁面功能相仿或整合：
  - 檢視 sitemap 內容、重新生成 sitemap、預覽、排程生成、下載
  - 區分 read-only 與可執行按鈕（重新生成）權限
  - 改動需記錄 audit_log
- PRD 會註記：請開發 Agent 直接參考 /admin/sitemap 的 UI 與互動細節

4.7 同意紀錄與個資匿除
- 註冊或第一次登入時要求同意（consents collection）：紀錄政策版本、accepted_at、IP、user_agent
- 提供使用者發起資料刪除 / 匿名化功能（soft delete 與 PII 匿名化）
- Admin 可查詢刪除請求與處理狀態

4.8 日誌與監控
- 紀錄 login success/fail、oauth callback、token refresh、backup/restore 操作
- 推薦用 JSON 日誌格式便於集中式收集（ELK / Loki 可選，PRD 保留未來接入）
- 實作基本 metrics：註冊數、活躍使用、登入錯誤率、備份次數

---

## 5. 非功能性需求（NFR）
- 安全
  - 遵守 OWASP Top 10 基本控管（XSS、CSRF、Injection、Broken Auth 等）
  - 對 cookie 設 HttpOnly、Secure、SameSite=strict/none（視跨域需求）
  - refresh token 存 DB（token hash），採 rotate 與撤銷策略
  - 驗證 id_token 簽章（OIDC）或 provider access token 的有效性
- 效能
  - 登入/驗證 API 平均延遲 < 300ms（地區差異除外）
  - 可支援峰值登入流量（設計以可橫向擴充為目標）
- 可用性
  - 99.5% 服務可用性目標（依現有 infra 能力調整）
- 相容性
  - Node 21、Next.js 與現有 Dockerfile（你提供）相容；MongoDB 7 (docker-compose 使用) 相容
- 可觀測性
  - 實作 healthcheck（Dockerfile 已帶 healthcheck），並在 /api/health 提供簡單 JSON 回應
- 合規
  - 同意紀錄、刪除請求流程、保留 policy 文件

---

## 6. 技術決策與整合細節（含相容性建議）
技術架構（高階）
- 前端（Next.js）：
  - 使用 NextAuth.js（API Routes / App Router variant 依專案架構）做為認證層（OAuth + Credentials）
  - Payload CMS 為後台（Self-hosted）與 users 資料管理介面（Payload 支援 MongoDB）
  - BFF / API Gateway：Next.js API routes 作為 BFF，處理 token 交換、驗證、與 Payload / DB 的溝通
- 後端 / DB：
  - MongoDB（Docker）：使用 single-node replica set 以支援 transactions（可透過 docker-compose init script 啟動 replset）
  - Collections：users, user_auth_providers, refresh_tokens, consents, audit_logs, backups
- 發信：
  - 必須照 /feedback 現有實作（參考 flattened-codebase.xml 中 /feedback 的 mail library 與 env 變數），在 PRD 中會列出 exact env keys 與使用方式，並在開發階段復用相同發信設定
- Session / Token：
  - NextAuth.js 產生 session 與 JWT（access token）；refresh token 儲存在 DB（refresh_tokens collection），採 rotate 機制
  - Access token 最佳 TTL：15 分鐘；Refresh token TTL：14 天（依需求調整）
- 權限管理：
  - Role-based access control (RBAC) 最小實作：roles（root/admin/user）；Admin 的細部 permission 可用 permission flags（view_users, edit_users, run_db_restore 等）
- Audit / Backup 操作：
  - DB backup / restore 操作觸發需記錄 audit_log（who, when, what, checksum）
  - 建議限制備份下載與 restore 權限為 Root 或有 explicit permission 的 Admin

相容性與具體 Docker 調整建議（依你提供的 Dockerfile/docker-compose）
- MongoDB replica set：
  - docker-compose 中的 mongodb 服務需加入 init script 以啟用 single-node replica set（無需外部付費）。在 ./docker/mongodb/init 加入腳本（例如 rs.initiate() 範例）。PRD 會附上 sample script 與說明。
- .env 處理：
  - 生產 Dockerfile 現在 COPY .env.production。請確認 .env.production 不含敏感值且在 CI/CD/部署時由 secrets 管理。PRD 建議使用環境變數注入（不要將密碼硬編碼於 repo）。
- Healthcheck：
  - Dockerfile 與 docker-compose 皆有 healthcheck。建議 healthcheck endpoint 回傳 DB 連線狀態與 next process 健康（/api/health）。
- Root 帳號初始化：
  - 建議透過 entrypoint script 檢查是否有 Root user；若無則從環境變數建立（e.g., ROOT_USERNAME, ROOT_PASSWORD），避免硬編碼到映像檔。
- 備份目錄：
  - Dockerfile 已建立 /app/db/backups 目錄。PRD 要求備份檔案存取權限、輪替策略與加密（至少密碼保護或限制存取）。
- 發信相容性：
  - PRD 會檢閱 flattened-codebase.xml 中 /feedback 實作，列出所用的 env 變數（例如 SMTP_HOST, SMTP_PORT, MAIL_FROM, MAIL_USER, MAIL_PASS 等）並在新模組內循環使用相同 keys。

具體 code-integration 注意事項（給開發 Agent）
- 直接參考 flattened-codebase.xml 中 /feedback 與 /admin/sitemap、/admin/database 的程式碼互動與 env keys。不要引入不同發信工具以免造成運維混亂。
- 將 Payload CMS schema 設計為可被 NextAuth.js 與現有 users collection 讀寫（避免 duplicate sources of truth）。
- NextAuth.js 與 Payload CMS 的 session 欄位需同步（若兩邊都需要 session，可選擇讓 NextAuth.js 為主授權源，Payload 透過 API token 呼叫取得管理操作）。

---

## 7. 資料模型（MongoDB Collections）
示例 schema（以 Payload/Next/Node 使用者模型為基礎）

users
- _id: ObjectId
- username: string (optional; for admin accounts)
- email: string (unique, indexed)
- email_verified: boolean
- password_hash: string | null
- display_name: string
- phone: string
- company: string
- title: string
- plan: string ('free'|'pro')
- role: string ('user'|'admin'|'root')
- created_at, updated_at, last_login_at, deleted_at
- preferences: object
- consents: [{ policy: string, version: string, accepted_at: Date, ip: string, ua: string }]

user_auth_providers
- _id
- user_id: ObjectId
- provider: string ('google'|'facebook'|'line')
- provider_user_id: string
- provider_email: string | null
- raw_profile: object
- created_at, updated_at

refresh_tokens
- _id
- user_id: ObjectId
- token_hash: string
- revoked: boolean
- created_at, expires_at, last_used_at, ip

audit_logs
- _id
- event_type: string
- user_id: ObjectId | null
- actor: string (admin user id or system)
- meta: object
- ip: string
- user_agent: string
- created_at: Date

backups
- _id
- name: string
- description: string
- created_by: user_id
- path: string
- checksum: string
- size: number
- created_at: Date

pending_social_registrations
- _id
- provider: string
- provider_profile: object
- temp_token: string
- created_at, expires_at
- ip

---

## 8. API & NextAuth 路徑（摘要）
- GET /api/auth/providers/start?provider=google  (或使用 NextAuth.js 自帶的 /api/auth/signin)
- GET /api/auth/callback/:provider  (NextAuth.js callback)
- POST /api/auth/register
- GET /api/auth/verify-email?token=
- POST /api/auth/login (credentials)
- POST /api/auth/forgot
- POST /api/auth/reset
- POST /api/auth/refresh
- POST /api/auth/logout
- GET /api/users/me
- GET /api/admin/users
- PATCH /api/admin/users/:id
- POST /api/admin/backups
- POST /api/admin/backups/:id/restore
- GET /api/admin/sitemap (與 existing /admin/sitemap 操作一致)
（具體 OpenAPI 規格可視需要另行產出）

---

## 9. 安全與合規（重點）
- OAuth: 使用 PKCE、驗證 state + nonce、驗證 id_token 簽章
- Token: short-lived access JWT，refresh token 存 DB（token hash）；refresh rotation 並可撤銷
- 密碼: bcrypt 或 argon2（Node 生態常用 bcrypt，採成本參數 12+）
- 備份檔加密與存取控制：備份不能任意下載或以公開方式儲存；限制下載權限並記錄 audit log
- 危險操作雙重確認（DB restore 等）
- 同意紀錄與刪除流程：保留 consents collection；提供匿除功能；刪除需審核
- 盡量避免在 repo 或映像內硬編碼秘密（使用 env / secrets manager）

---

## 10. 測試案例（代表性）
- OAuth POC
  - 成功完成 Google OAuth 登入並建立 user，email_verified=true（若 provider 驗證）
  - Provider 未回傳 email -> 產生 pending_social_registration，前端要求補填 email
- Email flow
  - 註冊後寄出驗證信，點擊後帳號 email_verified -> 可登入
  - 忘記密碼流程：寄出 reset link -> 可更新密碼
- Token
  - access token 過期後 refresh 流程成功，舊 refresh token 被旋轉並撤銷
- Admin 操作
  - Admin 新增/編輯 user，備份建立並能列出（但還原需二次確認）
- 安全測試
  - 防 CSRF（mutating endpoints）、XSS（輸入過濾）、暴力破解率限制

---

## 11. 開發優先順序與估時（建議 Sprint）
前提：每 Sprint 為 1 週（可依團隊節奏調整）。估時基於 2–3 名工程師（1 BE / 1 FE / 1 全端 或輪替）

Sprint 0（準備，1 週）
- 確認 env keys、Review flattened-codebase.xml 對 /feedback、/admin/sitemap、/admin/database 的具體程式碼（我將加入 dev note 要求 dev Agent 參考）
- 建立開發分支、初始化 Payload CMS schema 草案、NextAuth.js 設定、Docker Compose 調整（Mongo replset init script）
- Root 帳號 env 變數化設計

Sprint 1（POC，1–2 週）
- Google OAuth 成功流（NextAuth.js + Next.js 前端）
- Email register + verify（利用現有 /feedback 發信方式）
- users collection 基本 CRUD、user_auth_providers collection

Sprint 2（MVP，1–2 週）
- Refresh token persist、JWT 發放、session 管理
- Admin 基礎 User 管理頁面（Payload CMS integration）
- Member usage basic dashboard（DAU、註冊數）

Sprint 3（MVP 擴充，1–2 週）
- 備份/還原介面 PoC（DB backup create/list；restore 實作但需權限及審核）
- Sitemap 按鈕整合與權限控管
- 忘記密碼、reset flow

Sprint 4（穩定與測試，1 週）
- 整合測試、安全掃描、壓力測試
- 文檔、運維手冊（包含 replica set init、備份還原步驟）

後續（可選）
- Facebook / Line 接入、帳號合併 UI、MFA、SSO（企業）

---

## 12. 風險與緩解
- 風險：第三方 provider email 未提供（Line）導致註冊流程中斷  
  - 緩解：pending_social_registrations + 前端補填 email + 驗證機制
- 風險：備份/還原為危險操作導致資料遺失  
  - 緩解：權限控管、二次確認、audit_log、測試環境先驗證
- 風險：現有發信工具不一致造成打包或 env 混亂  
  - 緩解：強制使用 /feedback 現有 mail library 與 env keys（PRD 已註明）
- 風險：套件授權不符  
  - 緩解：PRD 嚴格限定 MIT / Apache-2.0，並列出建議套件

---

## 13. 交付物（交付格式）
- 完整 PRD（Markdown，用於儲存、分享、上 Jira / Confluence）
- MongoDB docker-compose + init script（single-node replica set 範例）
- NextAuth.js + Payload CMS minimal config 範例（POC）
- Next.js (API route) OAuth callback 與 register/verify 範例程式碼（Node）
- Admin pages wireframes 與任務拆解（Jira-style tasks）
- 測試案例清單與安全檢查清單

---

## 14. 開發 Agent 注意清單（重要）
- 絕對不得改用新的發信工具或 env keys：請直接參考並復用 flattened-codebase.xml 中 /feedback 的發信實作（library 與 env keys）。若需要，我可抽出 /feedback 的程式碼片段並放入 dev note 供 Agent 使用。
- /admin/sitemap 與 /admin/database 目前的按鈕與互動邏輯需被直接參考並整合；任何 UI 與行為上的細部更動需與 PM/Owner 討論。
- Root 帳號請以 env 變數初始化且上線時強制變更密碼。不要將 leosys/01517124 硬編碼於 repo。
- 備份檔案放置於 Dockerfile 指定的 /app/db/backups，需設定權限與存取控制。
- 所有新增的第三方 provider (Facebook/Line) 必須以 Google POC 作為模版，且在 PRD 中列出的 flows 必須被驗證。
- 套件選擇必須註明授權（MIT / Apache-2.0）；若 Agent 建議其他套件，需先在 PRD 備註其授權並獲得批准。

---

## 15. 下一步（請選擇）
1. 我現在產出完整的 OpenAPI 規格與 NextAuth + Payload minimal code scaffold（含 Docker-compose sample 與 Mongo replset init script）。請回覆 "*deliver-scaffold"。
2. 我將從 flattened-codebase.xml 擷取 /feedback、/admin/sitemap、/admin/database 的具體程式碼片段並產出開發用 dev-note（包含 env keys 與函式呼叫），便於開發 Agent 直接復用。請回覆 "*extract-dev-note"。
3. 先產出 MongoDB single-node replica set docker-compose + init script 的完整檔案與說明（*create-mongo-repl-docker）。
4. 需要我直接開始寫 Google OAuth POC 程式碼（NextAuth.js + Payload minimal integration）請回覆 "*create-poc-google-auth"。

請回覆你的選擇或告訴我要先調整 PRD 哪個部分，我會依選項繼續交付。

