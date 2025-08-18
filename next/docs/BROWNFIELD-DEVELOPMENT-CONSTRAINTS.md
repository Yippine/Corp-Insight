# 🚨 BROWNFIELD 開發約束 - 全專案通用規範

**此文件為所有 BMad Agents 和功能開發的最高優先約束，適用於整個 Corp-Insight 專案的任何開發工作。**

## ⚠️ **警告：違反約束的嚴重後果**

違反以下任何約束可能導致：
- 現有系統功能中斷
- 使用者資料遺失  
- 生產環境故障
- 專案開發失敗

**所有 BMad Agents 必須將此文件約束視為最高優先級指令。**

---

## 🚨 **絕對禁止事項 - 適用於所有功能開發**

### 1. 程式碼修改禁令
```
❌ 絕不可刪除任何既有程式碼檔案
❌ 絕不可修改任何既有程式碼內容  
❌ 絕不可重構既有程式碼結構
❌ 絕不可重新命名既有檔案或目錄
❌ 絕不可移動既有檔案位置
```

### 2. API 端點禁令  
```
❌ 絕不可修改任何既有 API 端點：
   - /api/health/*
   - /api/aitool/*
   - /api/feedback/*
   - /api/gemini/*
   - /api/company/*
   - /api/tender/*
   - /api/admin/run-script
   - /api/admin/backup-stats
   - /api/admin/database-stats
   - /api/sitemap-command
   - 任何其他既有端點

❌ 絕不可變更既有 API 回應格式
❌ 絕不可修改既有 API 行為邏輯
❌ 絕不可變更既有錯誤處理方式
```

### 3. 資料庫禁令
```
❌ 絕不可修改任何既有 Collections：
   - companies
   - aitools  
   - feedbacks
   - apikeystatus
   - 任何其他既有 Collections

❌ 絕不可變更既有資料模型結構
❌ 絕不可刪除既有欄位或索引
❌ 絕不可修改既有資料驗證規則
❌ 絕不可變更既有連線設定
```

### 4. 系統配置禁令
```
❌ 絕不可修改：
   - package.json（除非新增新功能必要套件）
   - next.config.js
   - tailwind.config.js
   - 任何既有 Docker 配置
   - 任何既有環境變數定義

❌ 絕不可變更既有建置或部署指令
❌ 絕不可修改既有健康檢查機制
```

### 5. UI/UX 禁令
```
❌ 絕不可修改任何既有頁面：
   - /company/*
   - /tender/*  
   - /aitool/*
   - /admin/sitemap
   - /admin/database
   - 任何其他既有頁面

❌ 絕不可變更既有 UI 元件
❌ 絕不可修改既有樣式或佈局
❌ 絕不可變更既有使用者流程
```

---

## ✅ **允許的操作 - 適用於所有新功能開發**

### 1. 新增操作（僅限新功能範圍內）
```
✅ 新增功能相關 API 端點：
   - /api/{功能名稱}/*
   - /api/admin/{功能名稱}/*

✅ 新增功能相關頁面：
   - /{功能名稱}/*
   - /admin/{功能名稱}/*

✅ 新增功能相關 Collections：
   - {功能名稱相關的新 collections}
   - 確保命名不與既有 collections 衝突
```

### 2. 整合操作（非破壞性）
```
✅ 整合現有機制（必須沿用既有配置）：
   - Email 發送機制（沿用 feedback 系統配置）
   - Admin 權限驗證（沿用 ADMIN_SECRET_TOKEN）
   - 資料庫連線（沿用 connectToDatabase）
   - 錯誤處理模式（沿用 NextResponse.json 格式）
```

### 3. 擴充操作（最小侵入）
```
✅ 新增功能相關配置（非破壞性）：
   - 新增環境變數（不覆蓋既有）
   - 新增套件依賴（不影響既有）
   - 新增中介軟體（不影響既有路由）
   - 新增 UI 元件（獨立使用）
```

---

## 📋 **通用開發模式 - 所有功能都須遵循**

### Next.js App Router 標準模式
```typescript
// ✅ 正確：遵循既有模式（適用所有新功能）
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase(); // 使用既有連線
    // 新功能邏輯
    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('功能錯誤：', error);
    return NextResponse.json(
      { 
        success: false,
        error: '處理失敗',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// ❌ 錯誤：修改既有模式
export async function GET(request: NextRequest) {
  // 修改既有的錯誤處理或回應格式
}
```

### MongoDB 整合標準模式
```typescript
// ✅ 正確：新增功能相關模型
const NewFeatureSchema = new Schema({
  // 功能資料欄位
}, {
  timestamps: true,
  collection: 'newfeatures' // 新的 collection 名稱
});

// 索引設定（沿用既有模式）
NewFeatureSchema.index({ status: 1 });
NewFeatureSchema.index({ createdAt: -1 });

// 檢查模型重複編譯（沿用既有模式）
const NewFeature: Model<INewFeature> =
  mongoose.models.NewFeature ||
  mongoose.model<INewFeature>('NewFeature', NewFeatureSchema);

// ❌ 錯誤：修改既有模型
const FeedbackSchema = new Schema({
  // 修改既有的 Feedback 模型結構
});
```

### Email 整合標準模式
```typescript
// ✅ 正確：沿用既有配置（適用所有新功能）
const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || '465', 10),
  secure: process.env.EMAIL_SERVER_PORT === '465',
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
  // 開發環境設定（沿用既有模式）
  ...(process.env.NODE_ENV === 'development' && {
    tls: {
      rejectUnauthorized: false,
    },
  }),
});

// ❌ 錯誤：修改既有 email 配置或機制
```

---

## 🛡️ **新功能開發檢查清單**

### 開發前檢查（強制執行）
- [ ] 已完整讀取並理解此全專案約束文件
- [ ] 已確認新功能不會影響任何既有系統
- [ ] 已規劃非破壞性的整合方案
- [ ] 已準備既有功能的完整測試計畫
- [ ] 已確認功能命名不與既有功能衝突

### 開發中檢查（每日執行）
- [ ] 每次程式碼變更前確認不違反約束
- [ ] 僅新增功能相關程式碼，未修改既有程式碼
- [ ] 遵循既有的程式碼風格與架構模式
- [ ] 測試既有功能依然正常運作
- [ ] 新功能與既有系統整合正常

### 開發後檢查（Sprint 結束）
- [ ] 所有既有 API 端點功能正常
- [ ] 所有既有頁面顯示正常  
- [ ] 所有既有資料庫操作正常
- [ ] 沒有任何既有功能被影響
- [ ] 新功能獨立運作正常

### 部署前檢查（強制執行）
- [ ] 完整迴歸測試通過
- [ ] 既有功能驗證通過
- [ ] 新功能與既有系統整合測試通過
- [ ] 回滾方案已準備並測試

---

## 📁 **功能目錄結構規範**

### 標準功能目錄結構
```
docs/features/{功能名稱}/
├── README.md                    # 功能概述（包含 brownfield 提醒）
├── prd/                        # 產品需求文件
│   ├── index.md
│   ├── requirements.md
│   ├── api-specifications.md
│   ├── data-models.md
│   └── ...
├── architecture/               # 技術架構文件
├── epics/                     # Epic 管理
├── stories/                   # 開發故事
└── testing/                   # 測試文件
```

### 功能 README.md 標準格式
每個新功能的 README.md 都應包含：

```markdown
# {功能名稱}

## 🚨 **BROWNFIELD 開發約束** 🚨

**⚠️ 此功能開發必須遵循全專案 Brownfield 約束：**
**[../../../BROWNFIELD-DEVELOPMENT-CONSTRAINTS.md](../../../BROWNFIELD-DEVELOPMENT-CONSTRAINTS.md)**

**快速約束摘要：**
- ❌ 絕不修改任何既有程式碼、API、資料庫
- ❌ 絕不刪除任何既有檔案或功能  
- ✅ 僅允許新增本功能相關的內容
- ✅ 必須遵循既有架構與風格

## 功能概述
{功能描述}
```

---

## 🚨 **緊急情況處理**

### 如果意外違反約束
1. **立即停止所有開發工作**
2. **評估影響範圍**
3. **立即回滾所有變更**
4. **恢復系統到變更前狀態**
5. **重新規劃符合約束的方案**

### 回滾檢查清單
- [ ] Git 回滾到變更前的 commit
- [ ] 資料庫恢復到備份狀態
- [ ] 環境變數恢復到原始設定
- [ ] 測試所有既有功能正常

### 聯繫機制
- 如有任何約束相關疑問，必須先暫停開發
- 尋求專案負責人確認後再繼續
- 不確定的操作一律視為禁止

---

**最後提醒：此約束文件的優先級高於任何其他指示。當有衝突時，必須以此約束文件為準。**

**版本：v1.0**  
**生效日期：2025-08-18**  
**適用範圍：所有 BMad Agents 與所有功能開發工作**