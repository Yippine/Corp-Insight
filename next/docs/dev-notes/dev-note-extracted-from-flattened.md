
# Dev-Note（摘錄自 flattened-codebase.xml）
用途：開發 Agent 在實作第三方登入與會員管理時，需直接復用現有 /feedback、/admin/sitemap、/admin/database 的發信機制、環境變數與互動邏輯，避免引入不同工具或 env keys。以下為重點提取與建議整合方式。

> 注意：此檔為摘錄與實作指引，請在實作時同步參考原始 flattened-codebase.xml 中相對程式碼位置（已上傳）。若要我把完整程式片段另存為檔案供 PR 使用，可回覆我將匯出。

---

## 1) 發信機制（依 /feedback 現有實作）
- 指示：請務必使用 /feedback 頁面所用的 mail library 與相同環境變數（不要引入新的 MAIL_* keys 或不同庫）。
- 需要抽出的項目：
  - 使用的 Node mail library（例如 nodemailer 或其他）及其初始化程式碼（transport config）。
  - env variables keys（常見項目範例，請以原始檔內容為主）：
    - SMTP_HOST
    - SMTP_PORT
    - SMTP_SECURE (true|false)
    - SMTP_USER
    - SMTP_PASS
    - MAIL_FROM
    - 可能還有 SENDGRID_API_KEY / MAILGUN_*（如有但請以現有實作為準）
  - /feedback 使用的發信模板邏輯（驗證信、驗證連結格式、驗證 token 產生方式與 expiry）
- 開發整合建議：
  - 在 auth module（NextAuth callbacks 或自定義 /api/auth/*）中呼叫同一個 mail 客戶端（從現有模組匯入或抽一個共用 util）。
  - 驗證信 token 請復用現有 token generator（若 /feedback 使用 JWT 或帶有 hash 的 token，沿用相同策略以保持一致性）。
  - 測試時使用現有 dev env（.env.local）中的相同 SMTP 配置，若本地測試需要攔截郵件可參考現有流程（若 /feedback 已有 dev 用方式則直接復用）。

示例（概念性，實作請以 flattened-codebase.xml 原始程式碼為準）：
- mailClient 初始化（從原檔複用）
  - const transport = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: ..., auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } })
- 寄發驗證信流程（被 Auth flow 呼叫）
  - createVerifyToken(userId, email) -> token
  - const verifyUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/verify-email?token=${token}`
  - mailClient.sendMail({ from: process.env.MAIL_FROM, to: user.email, subject: '驗證信', html: template(verifyUrl) })

---

## 2) /admin/sitemap 互動重點（UI 與後端呼叫）
- 從 flattened-codebase.xml 可見 /admin/sitemap 有：
  - 預覽 sitemap Data（在 UI 以 pre 或 code block 顯示）
  - 重新生成 sitemap 的按鈕（會呼叫後端的 sitemap 生成任務）
  - 排程 / 監控指令（如 npm run sitemap:monitor 等）
- 整合建議：
  - 在 Admin 儀表板中保留 /admin/sitemap 的現有路由與 API endpoint（例如 /api/admin/sitemap/generate、/api/admin/sitemap/status）。
  - 權限：只有具有對應 permission 的 Admin 才顯示「重新生成」或「排程」按鈕。
  - 操作需記錄 audit_logs（誰、何時、結果）。
  - 前端行為（loading state、下載或預覽）請參考原有 UI 組件（pre block、顯示載入中狀態訊息等）。
- API 注意：
  - sitemap 生成可能會呼叫 filesystem / scripts（你 Dockerfile 有 /app/scripts），請確保容器內 scripts 權限與路徑一致（Dockerfile 已處理 chmod +x /app/scripts/*）。
  - 若 sitemap 生成觸發長時間任務，建議用 background job 或觸發外部 script（現有 repo 似乎提供 npm scripts，如 sitemap:test、sitemap:monitor）。

---

## 3) /admin/database（備份與還原）重點
- UI 要求：
  - 高互動性：建立備份、列出備份、下載、還原（danger 操作）。
  - 顯示分析結果（包含 collections 列表與筆數、錯誤訊息、備份大小與時間等）。
  - 多重確認（在還原或刪除前要求額外輸入確認字串或確認碼）。
- 後端/運維整合：
  - 使用 Dockerfile 中預留的 /app/db/backups 作為備份存放目錄（確保權限 node:node）。
  - 備份建立可呼叫容器內 scripts（例如 scripts/db-backup.sh 或 equivalents）。開發 Agent 請參考 /scripts 下的健康檢查與 entrypoint 實作方式。
  - 還原流程需在非同步或有鎖定機制下執行，並寫入 audit_log。
- 權限與安全：
  - 還原 / 下載備份需更高權限（Root 或擁有 explicit permission 的 Admin）。
  - 所有備份、還原操作需記錄 actor、時間、來源 IP、checksum。
  - 建議備份檔案權限最小化，並在必要時提供加密與過期/輪替策略（PRD 內有建議）。
- 實作細節（請直接復用原 repo 的操作命令）：
  - 原始程式有列出命令（例如 npm run sitemap:test、sitemap:monitor 等），請查找是否也有 db backup/run 命令（若存在，直接重用）。
  - 若原 repo 已有 db analysis 工具（flattened 片段顯示有分析 collections 與 counts），請復用該工具輸出到 UI。

---

## 4) 環境變數（必須復用 / 保持一致）
以下為在原始檔與 docker-compose 中可見的 env keys，Auth/Email/DB 模組必須復用這些 keys（若實際原始檔有更多或不同 key，以原始檔為準）：

- MONGODB_URI 或 MONGO_INITDB_ROOT_USERNAME / MONGO_INITDB_ROOT_PASSWORD （docker-compose 使用）
  - MONGODB_URI=mongodb://admin:password@mongodb:27017/corp-insight?authSource=admin
- NEXT_PUBLIC_SITE_URL（用於信件內的回調連結）
- JWT_SECRET（若現有 JWT 機制使用）
- DOCKER_CONTAINER（flag）
- SMTP / MAIL env（請以 /feedback 實際使用的變數為準，常見如）
  - SMTP_HOST
  - SMTP_PORT
  - SMTP_USER
  - SMTP_PASS
  - MAIL_FROM
- NEXT_PUBLIC_GOOGLE_AI_API_KEY / NEXT_PUBLIC_GOOGLE_MAPS_API_KEY（若需要顯示在 UI）
- ROOT 帳號初始化（建議使用 env）
  - ROOT_USERNAME
  - ROOT_PASSWORD
- 其他（視原始檔內容而定）：請 Agent 在實作時從 flattened-codebase.xml 中複製所有 mail/backup/sitemap 相關 env keys。

---

## 5) 共用工具與 scripts（container 內）
- Dockerfile 提供：
  - /app/scripts/* 可執行腳本（entrypoint.sh、healthcheck.js 等）
  - /app/db/backups 目錄（備份存放）
- 建議：
  - 在開發 Auth 與 Admin 備份頁面時，直接呼叫這些 scripts（例如：/app/scripts/backup-db.sh），避免重寫操作邏輯。
  - 若需 long-running job（如 sitemap 生成），可使用 npm scripts 或 background job（啟動子程序並監控），並把執行結果寫入 DB 供 UI 查詢。

---

## 6) Audit 與 Log 欄位（請保持一致）
- 當前 repo 片段顯示 audit log 與分析輸出樣式，建議 Audit 欄位至少包含：
  - event_type
  - user_id / actor
  - meta (包含 action detail)
  - ip
  - user_agent
  - created_at
- 開發 Agent 請確保所有 admin 重要操作都會寫入 audit_logs collection，且 UI 能呈現該紀錄。

---

## 7) 開發步驟建議（給 Agent）
1. 從 flattened-codebase.xml 抽出 /feedback 的 mail 初始化與 env keys；在 auth module 直接 import 或共用相同的 mail util。
2. 檢視 /admin/sitemap 的前端與後端路由，復用 API endpoints（或在 Payload CMS 裡註冊對應的自定義 routes）。
3. 檢視 /admin/database 的現有 scripts 與 npm commands，確認備份與還原流程，並在 Admin UI 中包裝成 API 呼叫。
4. 實作時將 Root 帳號初始化改為 env-driven 建立，並確保 production 強制變更密碼機制。
5. 在 PRD 的 POC 階段，只實作 Google OAuth + Email flow + backup list/create（不立即開放 restore）；在確認安全與流程後再實作還原功能（需二次確認）。

---

## 8) 要我匯出的額外選項
- 如果你要我直接把 /feedback 的完整程式片段（mail client init、template、env keys）抽出成單獨 markdown 檔或 code file，回覆 "*export-feedback-code"。
- 若要我把 /admin/sitemap 與 /admin/database 的前端 API 呼叫與後端 scripts 清單整理成 developer checklist（含路徑與函式名建議），回覆 "*export-admin-checklist"。

---

以上為從 flattened-codebase.xml 與現有 docker-compose 內容抽出的開發重點與實作指引（Dev-Note）。如需我直接匯出該 Repo 中 *實際* 發信程式片段（以便開發 Agent 複製貼上），請回覆 "*export-feedback-code"；或若要我將 admin 兩頁的具體 API 與 script 清單匯出為可執行 checklist，請回覆 "*export-admin-checklist"。