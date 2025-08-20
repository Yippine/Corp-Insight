# 新功能開發範本

此文件為建立新功能目錄的標準範本，所有 BMad Agents 在建立新功能時都應該遵循此結構。

## 📁 標準功能目錄結構

```
docs/features/{功能名稱}/
├── README.md                    # 功能概述（必須包含 brownfield 約束提醒）
├── prd/                        # 產品需求文件目錄
│   ├── index.md                # PRD 總覽索引
│   ├── requirements.md         # 功能需求規格
│   ├── api-specifications.md   # API 設計規格
│   ├── data-models.md         # 資料模型設計
│   └── technical-constraints.md # 技術限制條件
├── architecture/               # 技術架構文件目錄
│   ├── index.md               # 架構總覽
│   ├── system-design.md       # 系統設計
│   └── integration-plan.md    # 整合計畫
├── epics/                     # Epic 管理目錄
├── stories/                   # 開發故事目錄
└── testing/                   # 測試文件目錄
    ├── test-cases.md          # 測試案例
    └── test-plan.md           # 測試計畫
```

## 📝 README.md 標準格式

每個新功能的 README.md 都**必須**包含以下內容：

```markdown
# {功能名稱}

## 🚨 **BROWNFIELD 開發約束** 🚨

**⚠️ 此功能開發必須遵循全專案 Brownfield 約束：**
**[../../BROWNFIELD-DEVELOPMENT-CONSTRAINTS.md](../../BROWNFIELD-DEVELOPMENT-CONSTRAINTS.md)**

**快速約束摘要：**

- ❌ 絕不修改任何既有程式碼、API、資料庫
- ❌ 絕不刪除任何既有檔案或功能
- ✅ 僅允許新增 {功能名稱} 相關的內容
- ✅ 必須遵循既有架構與風格

## 功能概述

{詳細的功能描述}

## 開發狀態

**狀態**：{開發中/規劃中/已完成}
**進度**：{百分比}
**開始日期**：{YYYY-MM-DD}
**負責團隊**：{團隊資訊}

## 技術架構

- **核心技術**：{遵循既有技術棧}
- **資料庫**：MongoDB (Docker)
- **整合方式**：{與既有系統的整合方式}

## 當前焦點

- **Epic**：{當前 Epic}
- **Story**：{當前 Story}
- **狀態**：{開發階段}

## 檔案結構

{列出此功能的檔案組織結構}

## 主要功能模組

{列出功能的主要模組}

## 技術約束

- **Brownfield 開發**：最小侵入現有程式碼
- **技術限制**：{具體的技術限制}
- **相容性要求**：{相容性要求}

## 成功指標

- {功能成功指標 1}
- {功能成功指標 2}
- {與現有系統無縫整合}
```

## 🔧 自動化建立新功能目錄

### 建立指令範例

```bash
# 建立新功能目錄結構
mkdir -p docs/features/{功能名稱}/{prd,architecture,epics,stories,testing}

# 複製 README 範本並替換功能名稱
cp FEATURE-TEMPLATE.md docs/features/{功能名稱}/README.md
# 手動編輯替換 {功能名稱} 為實際名稱

# 建立基本文件
touch docs/features/{功能名稱}/prd/index.md
touch docs/features/{功能名稱}/architecture/index.md
```

## 📋 新功能檢查清單

### 建立新功能目錄時必須檢查：

- [ ] 目錄結構符合標準範本
- [ ] README.md 包含 Brownfield 約束提醒
- [ ] 功能名稱不與既有功能衝突
- [ ] 所有文件都引用通用約束文件
- [ ] 技術規格符合既有架構模式

### 開發過程中必須檢查：

- [ ] 所有新增的 API 端點都在功能命名空間內
- [ ] 所有新增的資料模型都不影響既有結構
- [ ] 所有整合都是非破壞性的
- [ ] 遵循既有的錯誤處理和回應格式

## ⚠️ 重要提醒

1. **每個新功能都是獨立的**：不應該修改其他功能的文件或程式碼
2. **統一約束管理**：所有功能都引用同一個通用約束文件
3. **最小侵入原則**：新功能必須以最小影響方式整合到既有系統
4. **測試既有功能**：每次新增功能後都要測試既有功能是否正常

---

**此範本適用於所有新功能開發，確保專案的一致性與穩定性。**
