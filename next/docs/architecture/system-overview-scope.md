# 系統目標與範圍

## 系統目標

目標：在不改動現有主要流程與最小侵入的前提下，提供穩健的會員認證與管理系統，並將後台管理（Payload CMS）與認證（NextAuth.js）整合，實作 Google OAuth POC、Email 註冊/驗證、Admin 功能（含 DB 備份列舉與生成觸發）以及對 /admin/sitemap 與 /admin/database 的既有互動復用。

## 範圍定義

### 現階段範圍（MVP）

#### 核心認證功能
- **Google OAuth 整合：** Authorization Code Flow with PKCE
- **Email/密碼註冊：** 含 email 驗證流程
- **忘記密碼：** Email 重置流程
- **Session 管理：** JWT + refresh token 機制

#### 後台管理功能
- **Payload CMS 整合：** 作為 Admin 介面和 users 資料管理
- **會員管理：** 列表、搜尋、禁用/啟用、登入記錄
- **基礎儀表板：** DAU、註冊數、登入失敗率

#### 系統管理功能
- **DB 備份/還原：** 權限控管與操作審核
- **Sitemap 管理：** 整合現有 /admin/sitemap 功能
- **Database 管理：** 整合現有 /admin/database 功能

#### 發信機制
- **Email 驗證：** 註冊後驗證信發送
- **密碼重置：** 重置連結發送
- **相容性：** 使用現有 /feedback 發信機制

### 未來擴充範圍（Post-MVP）

#### 更多 OAuth Providers
- **Facebook 整合：** 在 Google POC 成功後實施
- **Line 整合：** 處理 email 未驗證情況
- **帳號合併：** 多 provider 綁定同一帳號

#### 進階安全功能
- **MFA （多因素認證）：** TOTP/SMS 支援
- **SSO （單一登入）：** 企業級整合
- **進階程岑管理：** 角色權限細化控制

#### 進階管理功能
- **進階分析：** 使用者行為分析、趨勢報告
- **自動化管理：** 自動備份、異常監控預警
- **審計增強：** 全面使用者操作記錄追蹤

## 技術架構範圍

### 前端範圍
- **Next.js App：** 使用現有架構，增加認證相關頁面
- **NextAuth.js：** API Routes 作為認證層
- **Payload CMS Admin：** Self-hosted 後台介面

### 後端範圍
- **API Layer：** Next.js API routes 作為 BFF
- **認證層：** NextAuth.js + JWT + refresh tokens
- **資料層：** MongoDB 作為主資料庫

### 基礎設施範圍
- **容器化：** Docker + docker-compose
- **資料庫：** MongoDB replica set (single-node)
- **發信服務：** 現有 SMTP 設定
- **監控：** 基本 healthcheck + 日誌

## Brownfield 限制與相容性

### 不可改動的範圍
- **現有 Dockerfile/docker-compose 架構**
- **現有 MongoDB 設定與資料**
- **現有 /feedback 發信機制**
- **現有 /admin/sitemap 和 /admin/database 介面**
- **現有 Next.js 應用架構**

### 必須整合的範圍
- **認證機制：** 與現有 user session 機制相容
- **資料模型：** 擴充但不破壞現有 users collection
- **環境變數：** 使用現有 env keys，避免衝突
- **API 路徑：** 使用 /api/auth/* 範圍避免與現有 API 衝突

### 新增範圍
- **認證相關 collections：** user_auth_providers, refresh_tokens, audit_logs
- **新登入頁面：** /auth/* 路徑下的前端頁面
- **Admin 擴充功能：** 在現有 admin 介面基礎上擴充
- **新系統服務：** Payload CMS 與 NextAuth.js 整合

## 成功指標與驗收標準

### 技術指標
- **Google OAuth 成功率：** ≥ 98%
- **Email 驗證完成率：** ≥ 95%
- **API 回應時間：** < 300ms 平均
- **系統可用性：** 99.5% 目標

### 功能指標
- **Admin 會員管理：** 列表、搜尋、禁用/啟用功能完整
- **備份操作：** 建立、列表、還原功能正常
- **安全審核：** 所有危險操作都有 audit log
- **相容性：** 現有功能不受影響

### 使用者體驗指標
- **登入流程：** 直覺且流暢
- **錯誤處理：** 清楚的錯誤訊息和指引
- **Admin 介面：** 與現有風格一致
- **行動裝置相容：** 支援基本響應式設計

---

**相關文件：**
- [系統邊界與使用案例](./system-boundaries-usecases.md)
- [高階架構拓朴](./high-level-architecture.md)
- [核心元件與責任](./core-components-responsibilities.md)
- [技術整合設計](./technical-integration.md)