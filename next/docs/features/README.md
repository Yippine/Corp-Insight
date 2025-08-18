# 功能模組總覽

此目錄包含 Corp-Insight 平台的所有功能模組，包含活躍開發、已完成與規劃中的功能。

## 活躍開發功能

### membership-system/
**會員管理系統** - 第三方登入與會員管理功能
- **狀態**：開發中
- **進度**：15%
- **負責團隊**：PO + Architect + Dev

## 規劃中功能

以下功能已建立初步架構，等待適當時機開始開發：

### data-integration/
**官方資料集自動整合管道**
- **優先順序**：中等
- **依賴**：data-pipeline 完成
- **主要目標**：自動化企業與標案資料同步

### frontend-optimization/
**前端樣式優化**
- **優先順序**：低
- **依賴**：membership-system 完成  
- **主要目標**：標案詳細頁樣式與 legacy 系統一致

### ai-tools-enhancement/
**AI 工具增強功能**
- **優先順序**：中等
- **依賴**：無
- **主要目標**：客製化模板與工具分類優化

### web-artifacts/
**Web Artifacts 展示平台**
- **優先順序**：低
- **依賴**：無
- **主要目標**：LLM Artifact 工具統一展示

### linebot-rag/
**Line Bot RAG Agent**
- **優先順序**：中等
- **依賴**：ai-tools-enhancement
- **主要目標**：智慧問答與資訊檢索服務

## 開發規範

### 模組結構
每個功能模組應包含：
```
feature-name/
├── README.md          # 功能概述（必要）
├── prd/              # 產品需求（PO 負責）
├── architecture/     # 技術架構（Architect 負責）
├── epics/           # Epic 管理（SM 負責）
├── stories/         # Story 開發（Dev 參考）
└── testing/         # 測試文件（QA 負責）
```

### BMad Method 流程
1. **PO**：建立 prd/ 相關文件
2. **Architect**：設計 architecture/ 技術方案
3. **SM**：規劃 epics/ 與 stories/ 開發順序
4. **Dev**：根據 stories/ 進行開發實作
5. **QA**：建立 testing/ 驗收標準

### Git 工作流程整合
- **開發階段**：使用 `.claude/commands/git/wip.md` 暫存進度
- **完成階段**：使用 `.claude/commands/git/release.md` 正式上版
- **規範遵循**：`docs/guidelines/coding-standards.md` 編碼規範

### 狀態管理
- 功能開發狀態追蹤：`docs/project-status.yml`
- 完成功能封存：`docs/archive/`
- 封存狀態記錄：`docs/archive-status.md`

## 注意事項

- 所有空白 README.md 檔案代表待開發功能
- 開始開發前請更新 `project-status.yml` 
- 完成開發後請執行封存流程
- 遵循 400 行檔案限制規範