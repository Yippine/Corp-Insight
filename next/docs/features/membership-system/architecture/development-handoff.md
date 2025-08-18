# 開發指令與交接 (Developer Handoff)

## 開發準備清單

### 必要的前置作業

☑️ **環境設定確認**
- [ ] 確認 Node.js 21 安裝
- [ ] 確認 Docker 和 docker-compose 可用
- [ ] 確認 MongoDB 7 容器正常運行
- [ ] 確認現有 Next.js 應用可正常啟動

☑️ **現有代碼分析完成**
- [ ] 完成 flattened-codebase.xml 分析
- [ ] 識別現有 /feedback 發信機制
- [ ] 識別現有 /admin/sitemap 交互細節
- [ ] 識別現有 /admin/database 交互細節
- [ ] 確認現有環境變數 (env keys)

### 核心技術決策再確認

✅ **必須使用技術**
- **NextAuth.js**: 認證層主要框架
- **Payload CMS**: 後台管理介面和資料管理
- **MongoDB**: 使用現有 Docker 容器，設定 replica set
- **MIT/Apache-2.0**: 所有新套件必須遵守授權限制

⚠️ **嚴格禁止**
- 不可更改現有發信工具或 env keys
- 不可使用非 OSS 或付費 SaaS 服務
- 不可破壞現有 /admin/sitemap 和 /admin/database 交互
- 不可硬編碼密碼或敏感資訊在 repo 中

## Sprint 實施計劃

### Sprint 0: 環境準備 (1 週)

**目標**: 確保開發環境就緒，所有前置條件滿足

**任務清單**:
- [ ] **環境變數調查** (優先級: 最高)
  - 從 flattened-codebase.xml 提取 /feedback 使用的 env keys
  - 確認 SMTP 相關設定: SMTP_HOST, SMTP_PORT, MAIL_FROM, MAIL_USER, MAIL_PASS
  - 記錄所有現有 env 變數以避免衝突

- [ ] **MongoDB Replica Set 設定** (優先級: 高)
  - 修改 docker-compose.yml 加入 replica set 初始化
  - 建立 ./docker/mongodb/init 脇本目錄
  - 編寫 rs.initiate() 初始化脇本
  - 測試 MongoDB transactions 支援

- [ ] **Payload CMS 初始化** (優先級: 高)
  - 安裝 payload 套件 (確認 MIT 授權)
  - 建立基本 Payload 設定檔 (payload.config.ts)
  - 設定 MongoDB 連線
  - 建立基本 users collection schema

- [ ] **NextAuth.js 初始化** (優先級: 高)
  - 安裝 next-auth 套件
  - 建立 [...nextauth].ts API route
  - 設定基本 Google OAuth provider
  - 設定 JWT 和 session 策略

- [ ] **Root 帳號環境化** (優先級: 中)
  - 設計 entrypoint script 檢查 Root user
  - 從 ROOT_USERNAME, ROOT_PASSWORD env 建立初始 Root
  - 實現首次登入強制變更密碼流程

**驗收標準**:
- MongoDB replica set 正常運作且支援 transactions
- Payload CMS admin 介面可正常訪問
- NextAuth.js 路徑回應正常
- Root 帳號可透過 env 變數建立

### Sprint 1: Google OAuth POC (1-2 週)

**目標**: 實現完整的 Google OAuth 登入流程及 Email 註冊驗證

**核心任務**:
- [ ] **Google OAuth 整合** (優先級: 最高)
  - 實現 Authorization Code Flow with PKCE
  - 處理 OAuth callback 和 profile 擷取
  - 實現帳號合併邏輯 (email matching)
  - 建立 user_auth_providers collection

- [ ] **Email 註冊驗證** (優先級: 最高)
  - 實現 POST /api/auth/register endpoint
  - 復用現有 /feedback 發信機制
  - 建立 email 驗證 token 機制
  - 實現 GET /api/auth/verify-email?token= endpoint

- [ ] **基本前端頁面** (優先級: 高)
  - 建立 /auth/signin 登入頁面
  - 建立 /auth/register 註冊頁面
  - 建立 /auth/verify-email 驗證頁面
  - 整合 NextAuth.js 的 useSession hook

- [ ] **基本錯誤處理** (優先級: 中)
  - 實現基本錯誤頁面
  - 設定錯誤日誌記錄
  - 實現使用者友善的錯誤訊息

**驗收標準**:
- Google OAuth 成功率 ≥ 98%
- Email 驗證郵件正常發送
- 新帳號註冊流程完整
- 帳號合併正常運作

### Sprint 2: Session 管理與 Admin 基礎 (1-2 週)

**目標**: 完成 token 管理機制和基本 Admin 介面

**核心任務**:
- [ ] **Refresh Token 永久化** (優先級: 最高)
  - 建立 refresh_tokens collection
  - 實現 token rotation 機制
  - 實現 POST /api/auth/refresh endpoint
  - 實現 token 撤銷機制

- [ ] **JWT 發放與驗證** (優先級: 最高)
  - 設定 access token TTL (15分鐘)
  - 設定 refresh token TTL (14天)
  - 實現 token 驗證 middleware
  - 完成 NextAuth.js 的 JWT 策略設定

- [ ] **Payload CMS 整合** (優先級: 高)
  - 設定 Payload 與 NextAuth 的 session 同步
  - 建立 Admin users collection schema
  - 實現基本權限检查 (roles: root/admin/user)
  - 測試 Payload admin 介面訪問

- [ ] **基本會員管理** (優先級: 高)
  - 建立 GET /api/admin/users 列表 API
  - 實現搜尋、過濾、分頁功能
  - 建立基本 user detail 頁面
  - 實現禁用/啟用帳號功能

**驗收標準**:
- Token refresh 機制正常運作
- Payload CMS admin 介面可登入使用
- 會員列表可正常瀏覽和操作
- 基本權限控制正常

### Sprint 3: 系統管理功能 (1-2 週)

**目標**: 實現備份/還原、Sitemap 管理及忘記密碼功能

**核心任務**:
- [ ] **備份/還原介面** (優先級: 最高)
  - 整合現有 /admin/database 介面
  - 實現 POST /api/admin/backups 建立備份
  - 實現備份列表與下載功能
  - 實現 POST /api/admin/backups/:id/restore 還原
  - 加入權限控制和二次確認

- [ ] **Sitemap 管理整合** (優先級: 高)
  - 復用現有 /admin/sitemap 交互邏輯
  - 整合權限控制 (read-only vs 可執行)
  - 加入 audit log 記錄
  - 測試所有既有功能相容性

- [ ] **忘記密碼流程** (優先級: 中)
  - 實現 POST /api/auth/forgot endpoint
  - 實現 GET /api/auth/reset?token= endpoint
  - 使用現有發信機制發送重置連結
  - 加入 token 過期與安全檢查

- [ ] **Audit Log 系統** (優先級: 中)
  - 建立 audit_logs collection
  - 記錄登入/登出、OAuth callback、備份/還原操作
  - 實現基本 audit log 查詢介面
  - 設定日誌輪替策略

**驗收標準**:
- 備份建立和還原功能正常
- 現有 Sitemap 功能不受影響
- 忘記密碼流程完整
- 所有重要操作都有 audit log

### Sprint 4: 測試與穩定化 (1 週)

**目標**: 全面測試、安全檢查和效能優化

**核心任務**:
- [ ] **整合測試** (優先級: 最高)
  - E2E 測試: Google OAuth 完整流程
  - E2E 測試: Email 註冊驗證流程
  - E2E 測試: Admin 會員管理功能
  - E2E 測試: 備份/還原功能

- [ ] **安全掃描** (優先級: 高)
  - CSRF 保護測試 (state, nonce 驗證)
  - XSS 防護測試 (輸入過濾)
  - SQL Injection 防護 (MongoDB injection)
  - 權限縱權測試
  - 敏感資料洩漏檢查

- [ ] **效能測試** (優先級: 中)
  - API 回應時間測試 (< 300ms 目標)
  - 併發登入壓力測試
  - 資料庫連線集測試
  - 大量用戶數據測試

- [ ] **文檔與運維** (優先級: 中)
  - 更新 README 和部署文檔
  - 建立測試案例文檔
  - 建立緊急回復程序
  - 建立監控和預警設定

**驗收標準**:
- 所有功能通過 E2E 測試
- 安全掃描無重大風險
- 效能指標達成 (< 300ms, 99.5% 可用性)
- 部署文檔完整且可操作

## 重要開發注意事項

### 絕對禁止事項 ⛔

1. **發信機制**: 絕對不得改用新發信工具或 env keys
2. **現有介面**: 不可破壞 /admin/sitemap 和 /admin/database 的交互邏輯
3. **Root 帳號**: 不要將 leosys/01517124 硬編碼於 repo
4. **授權限制**: 所有套件必須為 MIT 或 Apache-2.0 授權
5. **備份檔案**: 必須設定權限與存取控制

### 必須避行的最佳實務 ✅

1. **直接參考現有實現**:
   - flattened-codebase.xml 中 /feedback 的發信實現
   - /admin/sitemap 和 /admin/database 的 UI 和行為細節

2. **保持相容性**:
   - NextAuth.js 與 Payload CMS 的 session 欄位同步
   - 現有 users collection 的擴充而非重建

3. **安全最佳實務**:
   - 設定 HttpOnly, Secure, SameSite cookie 屬性
   - refresh token 儲存 hash 而非明文
   - 實現 token rotation 和撤銷機制

4. **監控與日誌**:
   - 所有重要操作都要記錄 audit log
   - 建立 JSON 日誌格式以便集中式收集
   - 實作基本 metrics 和 healthcheck

## 技術整合檢查清單

### Payload CMS 整合確認
- [ ] Payload 設定檔正確配置 MongoDB 連線
- [ ] 權限 schema 與 NextAuth.js 角色相容
- [ ] Admin 介面可正常訪問和操作
- [ ] users collection 支援必要欄位和索引

### NextAuth.js 整合確認
- [ ] Google OAuth provider 正確設定
- [ ] JWT 策略支援自定欄位
- [ ] Session 策略與 database adapter 正確設定
- [ ] Callback 函數正確處理 provider profile

### MongoDB 設定確認
- [ ] Replica set 正常初始化且支援 transactions
- [ ] 所有必要 collections 建立和索引正確
- [ ] 備份目錄 /app/db/backups 可寫入
- [ ] 資料庫連線集配置正確

### 發信機制確認
- [ ] 現有 SMTP 設定 env 變數全部復用
- [ ] Email 驗證和密碼重置郵件正常發送
- [ ] 郵件樣板與現有風格一致
- [ ] 發信錯誤處理正確

---

## 緊急聯絡資訊

**技術支援**: 出現技術問題時請先檢查本文件和相關 PRD  
**架構問題**: 需要架構決策時請參考[技術整合設計](./technical-integration.md)  
**安全問題**: 安全相關問題請參考[安全合規設計](./security-compliance.md)  

---

**相關文件:**
- [核心元件與責任](./core-components-responsibilities.md)
- [部署與運維指引](./deployment-operations.md)
- [風險緩解策略](./risk-mitigation.md)
- [PRD 開發優先順序](../prd/development-priorities.md)