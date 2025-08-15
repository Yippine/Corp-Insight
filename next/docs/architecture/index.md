# 專案文件 — 架構與設計（Architect Level）

適用範圍：在既有企業洞察平台上，建置第三方登入（Google 起步）、Email/password、會員管理、Admin 儀表板、Sitemap / Database 管理整合（Brownfield）。

技術要求：Payload CMS、NextAuth.js、Next.js（現有專案）、MongoDB (Docker)，全部套件需為 MIT 或 Apache-2.0 授權。

## 架構文件結構

### 系統概述文件
- [系統目標與範圍](./system-overview-scope.md) - 整體系統目標與範圍定義
- [系統邊界與使用案例](./system-boundaries-usecases.md) - 系統邊界與使用案例分析
- [高階架構拓朴](./high-level-architecture.md) - 部署節點與流程設計

### 核心元件設計
- [核心元件與責任](./core-components-responsibilities.md) - 元件架構與責任分工
- [資料流設計](./data-flow-design.md) - Auth、Signup、Backup/Restore、Sitemap 流程
- [技術整合設計](./technical-integration.md) - 架構整合與相容性設計

### 子系統架構
- [認證子系統](./subsystems/architecture-subsystem-auth.md) - OAuth 與認證機制
- [管理子系統](./subsystems/architecture-subsystem-admin.md) - 後台管理介面
- [備份還原子系統](./subsystems/architecture-subsystem-backup-restore.md) - 資料庫備份管理
- [郵件子系統](./subsystems/architecture-subsystem-mail.md) - 發信機制設計
- [監控子系統](./subsystems/architecture-subsystem-observability.md) - 日誌與監控
- [Sitemap 子系統](./subsystems/architecture-subsystem-sitemap.md) - 網站地圖管理

### 部署與運維
- [部署與運維指引](./deployment-operations.md) - Docker / Mongo replica set 設定
- [安全合規設計](./security-compliance.md) - 安全與合規要點
- [風險緩解策略](./risk-mitigation.md) - 架構風險識別與緩解

### 交付與開發指引
- [交付物與里程碑](./deliverables-milestones.md) - Architect handoff 交付物
- [開發指令與交接](./development-handoff.md) - Developer Handoff 指引
- [環境變數與檔案建議](./environment-configuration.md) - 部署設定與環境變數

## 架構文件使用指引

### 對於開發團隊
1. **系統理解：** 從[系統目標與範圍](./system-overview-scope.md)開始理解整體架構
2. **技術整合：** 閱讀[技術整合設計](./technical-integration.md)確保技術選擇合規
3. **子系統實作：** 根據 Sprint 重點參考對應子系統架構文件
4. **部署準備：** 使用[部署與運維指引](./deployment-operations.md)進行環境設定

### 對於架構師
1. **架構決策：** 使用[核心元件與責任](./core-components-responsibilities.md)進行架構決策
2. **風險管理：** 監控[風險緩解策略](./risk-mitigation.md)識別的風險點
3. **整合檢查：** 確保[技術整合設計](./technical-integration.md)的完整性

### 對於 DevOps 團隊
1. **部署準備：** 使用[部署與運維指引](./deployment-operations.md)設定環境
2. **安全設定：** 實施[安全合規設計](./security-compliance.md)的安全措施
3. **監控設定：** 部署[監控子系統](./subsystems/architecture-subsystem-observability.md)

## 架構決策記錄 (ADR)

### 核心技術決策
1. **認證架構：** NextAuth.js + Payload CMS 的選擇理由
2. **資料庫設計：** MongoDB replica set 的必要性
3. **子系統分離：** 模組化設計的理由
4. **安全考量：** JWT + Refresh Token 的安全模式

### 技術限制考量
- **Brownfield 限制：** 最小侵入現有系統的原則
- **授權限制：** MIT/Apache-2.0 OSS 的遵守
- **相容性要求：** 與現有 Dockerfile/docker-compose 的相容

---

**文件版本：** v1.0  
**最後更新：** Phase 4 - Save and Shard  
**適用專案：** 企業洞察平台會員管理系統（Brownfield）  
**相關 PRD：** [PRD 文件索引](../prd/index.md)