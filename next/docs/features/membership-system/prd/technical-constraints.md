# 技術限制與前提（Brownfield）

## 必須技術約束

- **必須使用：** Payload CMS + NextAuth.js
- **套件授權：** 其餘套件或工具需為 MIT 或 Apache-2.0 授權之 OSS
- **資料庫：** MongoDB（Docker 容器）。不可使用付費 SaaS（如 Atlas）或非授權套件
- **環境要求：** Node 21、Next.js 與現有 Dockerfile 相容；MongoDB 7 (docker-compose 使用) 相容

## 瀏覽器支援

- **Edge：** Chromium-based 最近兩版
- **Chrome：** 最近兩版

## 初始化設定

- **Root 初始帳號：** 預設 leosys / 01517124
- **PRD 建議：** 以環境變數初始化並於首次登入強制變更密碼

## 發信機制限制

- **必須遵循：** 請以專案既有 /feedback 實作機制為準
- **不可另外引入：** MailHog 除非為 local dev
- **PRD 將檢視：** 現有程式碼使用的 mail library 和 env 變數並比照實作

## Docker 與部署限制

### MongoDB 設定
- **Replica Set：** 使用 single-node replica set 以支援 transactions
- **初始化：** 可透過 docker-compose init script 啟動 replset

### .env 處理
- **生產 Dockerfile：** 現在 COPY .env.production
- **安全要求：** 確認 .env.production 不含敏感值且在 CI/CD/部署時由 secrets 管理
- **建議：** 使用環境變數注入（不要將密碼硬編碼於 repo）

### Healthcheck
- **現有支援：** Dockerfile 與 docker-compose 皆有 healthcheck
- **建議：** healthcheck endpoint 回傳 DB 連線狀態與 next process 健康（/api/health）

### 備份目錄
- **既有設定：** Dockerfile 已建立 /app/db/backups 目錄
- **PRD 要求：** 備份檔案存取權限、輪替策略與加密（至少密碼保護或限制存取）

## 既有系統整合要求

### 發信相容性
- **必須循環：** flattened-codebase.xml 中 /feedback 實作
- **env 變數：** 使用相同 keys（例如 SMTP_HOST, SMTP_PORT, MAIL_FROM, MAIL_USER, MAIL_PASS 等）

### 現有頁面整合
- **/admin/sitemap：** 需直接參考並整合既有交互邏輯
- **/admin/database：** 需直接參考並整合既有程式碼互動與 env keys

### Root 帳號初始化
- **建議：** 透過 entrypoint script 檢查是否有 Root user
- **環境變數：** 從 ROOT_USERNAME, ROOT_PASSWORD 建立避免硬編碼到映像檔

---

**重要提醒：** 這些限制條件都是為了維持系統穩定性和相容性，必須嚴格遵守。

**相關文件：**
- [專案概述與目標](./project-overview-goals.md)
- [開發注意事項](./development-guidelines.md)
- [資料模型規格](./data-models.md)