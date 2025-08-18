# 會員管理系統

## 功能概述

第三方登入與會員管理系統，整合 Google OAuth、Email/密碼註冊、後台管理等完整會員功能。

## 開發狀態

**狀態**：開發中
**進度**：15%
**開始日期**：2025-06-20
**負責團隊**：PO + Architect + Dev

## 技術架構

- **認證系統**：NextAuth.js + Payload CMS
- **資料庫**：MongoDB (Docker)
- **第三方整合**：Google OAuth (優先) → Facebook、Line
- **後台管理**：整合現有 Admin Console 功能

## 當前焦點

- **Epic**：epic-1-google-oauth
- **Story**：1.1.google-oauth-setup
- **狀態**：規劃階段

## 檔案結構

```
membership-system/
├── README.md              # 本檔案
├── prd/                   # 產品需求文件
│   ├── index.md          # PRD 主索引
│   ├── brownfield-prd-membership-auth.md
│   ├── project-overview-goals.md
│   ├── technical-constraints.md
│   ├── user-roles.md
│   └── oauth-requirements.md
├── architecture/          # 技術架構文件
│   ├── index.md          # 架構主索引
│   ├── system-overview-scope.md
│   ├── development-handoff.md
│   └── subsystems/       # 子系統架構
├── epics/                # Epic 管理
│   └── epic-1-google-oauth.md
├── stories/              # 開發故事
│   └── 1.1.google-oauth-setup.md
└── testing/              # 測試文件（待建立）
```

## 主要功能模組

### 認證模組
- Google OAuth 第三方登入
- Email/密碼本地註冊
- Email 驗證機制
- 忘記密碼功能

### 會員管理模組
- 使用者個人資料管理
- 權限角色系統 (User/Admin/Root)
- 會員狀態管理

### 後台管理模組
- Admin 儀表板
- 會員管理介面
- 系統監控整合
- 資料庫管理功能

## 技術約束

- **Brownfield 開發**：最小侵入現有程式碼
- **開源授權**：僅使用 MIT 或 Apache-2.0 授權套件
- **瀏覽器支援**：Chrome、Edge (最近兩版)
- **容器化部署**：與現有 Docker 環境相容

## 成功指標

- Google 第三方登入功能正確率 ≥ 98%
- Email 驗證完成率 ≥ 95%  
- Admin 後台完整會員管理功能
- 與現有系統無縫整合