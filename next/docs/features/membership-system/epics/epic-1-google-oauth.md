# Epic 1: Google 第三方登入整合 (POC)

## Epic 目標

實現 Google 第三方登入功能，作為第三方登入系統的概念驗證 (POC)，達到 98% 功能正確率。為後續 Facebook 和 Line 登入奠定基礎架構。

## Epic 描述

### 現有系統脈絡

- **技術棧：** Next.js + MongoDB (Docker化) + JWT 機制
- **會員體系：** 前/後台分離的角色系統 (User/Admin/Root)
- **專案性質：** Brownfield 增強，需要最小侵入現有系統

### 整合目標

實現完整的 Google OAuth 2.0 with PKCE 流程，包含：

- NextAuth.js 作為認證中介
- 帳號自動合併邏輯 (基於 email)
- 安全的 JWT token 發放機制
- Payload CMS 後台管理整合

### 成功標準

- Google OAuth 登入成功率 ≥ 98%
- 支援帳號合併與新用戶創建
- 完整的安全驗證 (CSRF, PKCE, nonce)
- 錯誤處理與日誌記錄

## 使用者故事

### 1.1 Google OAuth 基礎設定與 NextAuth.js 整合

**使用者故事：** 作為系統管理員，我需要配置 Google OAuth 應用程式和 NextAuth.js，以便用戶可以使用 Google 帳號登入系統。

**驗收標準：**

- Google Cloud Console OAuth 應用程式設定完成
- NextAuth.js 配置檔包含 Google provider 設定
- 環境變數設定 (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)
- OAuth callback URL 正確配置
- 基本的 Google 登入按鈕顯示

### 1.2 Google OAuth 認證流程實作

**使用者故事：** 作為一般使用者，我想要點擊 "Google 登入" 按鈕後能順利完成認證，並且能夠安全地登入系統。

**驗收標準：**

- 完整的 Authorization Code Flow with PKCE
- 正確的 state, nonce, PKCE 驗證
- Google 用戶資料取得 (email, name, email_verified)
- ID token 和 access token 驗證
- 安全的 callback 處理

### 1.3 帳號合併與用戶管理邏輯

**使用者故事：** 作為使用者，當我用 Google 登入時，系統應該能夠智能地合併我的現有帳號或創建新帳號，並正確管理我的登入狀態。

**驗收標準：**

- 基於 email 的帳號自動合併
- 新用戶自動創建 (email_verified: true)
- user_auth_providers 關聯記錄建立
- JWT access token 和 refresh token 發放
- Session 管理與狀態維護

### 1.4 錯誤處理與安全加強

**使用者故事：** 作為系統管理員，我需要系統能夠妥善處理各種 OAuth 錯誤情況，並且記錄詳細的審核日誌，以確保系統安全性。

**驗收標準：**

- 用戶取消登入的友善處理
- Provider 錯誤的適當回應
- CSRF 和重放攻擊防護
- 詳細的 audit_log 記錄
- 錯誤監控與通知機制

### 1.5 後台管理與監控整合

**使用者故事：** 作為管理員，我需要在 Payload CMS 後台看到通過 Google 登入的用戶資訊，並能夠監控登入活動和系統狀態。

**驗收標準：**

- Payload CMS users collection 顯示 Google 用戶
- 用戶詳情頁顯示 auth provider 綁定資訊
- 登入記錄與活動追蹤
- OAuth 相關的儀表板統計
- 基本的錯誤監控介面

## 技術要求

### 核心依賴

- NextAuth.js (^4.x) - OAuth 認證中介
- Payload CMS - 後台管理
- MongoDB - 用戶與 session 資料存儲
- 現有的 JWT token 機制

### API 端點

- `GET /api/auth/signin/google` - 發起 Google OAuth
- `GET /api/auth/callback/google` - Google OAuth callback
- `GET /api/auth/providers` - 取得可用 provider 列表

### 資料庫 Collections

- `users` - 用戶基本資料
- `user_auth_providers` - 第三方登入綁定
- `audit_logs` - OAuth 活動記錄

## 風險評估

### 主要風險

- OAuth 設定錯誤導致認證失敗
- 帳號合併邏輯衝突
- 現有 JWT 系統整合問題

### 緩解策略

- 詳細的測試案例覆蓋
- 漸進式部署與回滾機制
- 完整的錯誤處理與監控

## Definition of Done

- [ ] 所有 5 個使用者故事完成且驗收標準達成
- [ ] Google OAuth 登入成功率 ≥ 98%
- [ ] 完整的錯誤處理與安全驗證
- [ ] Payload CMS 後台管理功能正常
- [ ] 詳細的測試覆蓋與文件更新
- [ ] 現有功能無回歸問題

---

**Epic 負責人：** 開發團隊
**預估時程：** 2-3 週
**依賴：** 無
**後續 Epic：** Epic 2 (Facebook 登入), Epic 3 (Line 登入)
