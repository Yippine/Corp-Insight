# Brownfield PRD — 第三方登入與會員管理系統

本文件為企業洞察平台（既有 flattened-codebase.xml / Next.js 專案）的會員管理系統 PRD 索引。

技術要求：Payload CMS + NextAuth.js 為核心；所有額外套件採用 MIT 或 Apache-2.0 授權之開源軟體。

## PRD 文件結構

### 核心規劃文件
- [專案概述與目標](./project-overview-goals.md) - 專案摘要、成功指標、MVP 範圍
- [技術限制與前提](./technical-constraints.md) - Brownfield 限制條件與技術決策
- [使用者角色定義](./user-roles.md) - 系統角色與權限體系

### 功能需求文件
- [第三方登入需求](./oauth-requirements.md) - Google/Facebook/Line OAuth 流程
- [帳號管理需求](./account-management.md) - 註冊、驗證、密碼重置
- [後台管理需求](./admin-requirements.md) - Admin 介面與權限管理
- [資料備份需求](./backup-requirements.md) - MongoDB 備份/還原功能
- [系統管理需求](./system-management.md) - Sitemap 管理與監控

### 技術規格文件  
- [資料模型規格](./data-models.md) - MongoDB Collections 設計
- [API 設計規格](./api-specifications.md) - NextAuth 路徑與 API 端點
- [安全合規規格](./security-compliance.md) - 安全要求與合規設計
- [測試案例規格](./test-cases.md) - 代表性測試場景

### 開發指引文件
- [開發優先順序](./development-priorities.md) - Sprint 規劃與估時
- [風險緩解策略](./risk-mitigation.md) - 專案風險與緩解措施
- [開發注意事項](./development-guidelines.md) - 開發 Agent 重要提醒

### 交付與下一步
- [交付物清單](./deliverables.md) - 完整交付格式說明
- [後續行動](./next-actions.md) - 開發啟動選項

## 文件使用指引

**對於開發團隊：**
1. 從[專案概述與目標](./project-overview-goals.md)開始理解整體方向
2. 閱讀[技術限制與前提](./technical-constraints.md)確保技術決策合規
3. 根據開發 Sprint 重點閱讀對應的功能需求文件
4. 實作時參考技術規格文件確保一致性

**對於專案管理：**
1. 使用[開發優先順序](./development-priorities.md)進行 Sprint 規劃
2. 監控[風險緩解策略](./risk-mitigation.md)識別的風險點
3. 確保[交付物清單](./deliverables.md)的完整性

---

**文件版本：** v1.0  
**最後更新：** Phase 4 - Save and Shard  
**適用專案：** 企業洞察平台會員管理系統（Brownfield）