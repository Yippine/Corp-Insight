# 標案詳情頁遷移專案文檔

> **目標**: 將 Legacy 專案的完整 UI/UX 標案詳情頁遷移到 Next.js SSR 架構

## 📋 專案概述

本專案旨在將 `legacy/` 專案中功能完整的 `/tender/detail/[tender_id]` 頁面遷移至 `next/` 專案，確保在 Next.js SSR 架構下完美繼承 Legacy 的所有 UI/UX 特性，同時獲得 SEO 與效能優勢。

### 當前狀態對比

| 指標 | Legacy (完整版) | Next (簡陋版) | 遷移後目標 |
|-----|----------------|--------------|-----------|
| **UI/UX 完整性** | 9/10 | 5/10 | 9/10 |
| **功能豐富度** | 9/10 | 6/10 | 9/10 |
| **SEO 友善度** | 6/10 | 8/10 | 10/10 |
| **首屏載入速度** | 7/10 | 7/10 | 9/10 |
| **代碼行數** | 1,182 行 | 757 行 | ~1,200 行 |

### 核心差異

**Legacy 優勢 (需保留):**
- ✅ **228 行智能 FieldRenderer** - 自動識別電話/Email/URL/地址
- ✅ **12 種頁籤圖標映射** - 視覺引導清晰
- ✅ **Framer Motion 豐富動畫** - 互動體驗流暢
- ✅ **CommitteeCard 完整版** - 評選委員詳細資訊
- ✅ **深度感知樣式系統** - 視覺層次分明

**Next 優勢 (已具備):**
- ✅ Server-side Metadata (SEO 優化)
- ✅ MongoDB 伺服器快取 (效能優化)
- ✅ 現代化技術棧 (App Router)

---

## 📁 文檔結構

```
tender-detail-migration/
├── README.md                           # 👈 本文檔 - 總覽與快速開始
├── explore-analysis/                   # Explore Agent 深度分析
│   ├── INDEX.md                        # 📌 文檔導航索引
│   ├── ANALYSIS_SUMMARY.txt            # 📄 執行摘要 (快速參考)
│   ├── tender_detail_analysis.md       # 📘 完整技術對比 (868 行)
│   ├── COMPONENT_TREE.md               # 🌲 組件樹狀結構
│   └── MIGRATION_GUIDE.md              # 📗 逐步遷移指南
└── execution-analysis/                 # Execution Agent Formula 解析
    └── formula-analysis.md             # 🧮 數學公式化分析
```

### 文檔閱讀建議

**快速了解 (15 分鐘):**
1. 本文檔 `README.md` - 總覽與關鍵結論
2. `explore-analysis/ANALYSIS_SUMMARY.txt` - 執行摘要與行動計畫

**深度理解 (1-2 小時):**
3. `explore-analysis/tender_detail_analysis.md` - 代碼級別詳細對比
4. `execution-analysis/formula-analysis.md` - Formula 視角解析
5. `explore-analysis/COMPONENT_TREE.md` - 組件結構視覺化

**實施參考 (開發期間):**
6. `explore-analysis/MIGRATION_GUIDE.md` - 逐步實施指南 + 源代碼

---

## 🎯 關鍵發現摘要

### 1. 缺失的核心組件

**FieldRenderer (228 行) - 最嚴重的功能退化**

Legacy 實現:
```typescript
// 智能內容識別
const isPhoneNumber = /^[\d\s\-()]+$/.test(value) && value.length >= 8;
const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const isURL = /^https?:\/\/.+/.test(value);
const isAddress = value.includes('縣') || value.includes('市') || value.includes('區');

// 遞迴渲染巢狀結構
if (children && children.length > 0) {
  return (
    <FieldRenderer
      field={child}
      depth={depth + 1}
      parentKey={fieldKey}
    />
  );
}
```

Next 現狀: **完全缺失** ❌

**影響:**
- 電話號碼無法自動連結撥打
- Email 無法自動開啟郵件客戶端
- 網址無法自動轉換為超連結
- 地址無法自動開啟地圖
- 巢狀資料展示不完整

### 2. 視覺引導元素缺失

**Tab 圖標映射 (12 種)**

Legacy 實現:
```typescript
const iconMap: Record<string, LucideIcon> = {
  '標案基本資料': Building2,
  '招標資訊': FileText,
  '決標資訊': Award,
  '最有利標': Users,
  // ... 共 12 種
};
```

Next 現狀: **全部移除** ❌

### 3. 動畫體驗缺失

**Framer Motion 動畫**

Legacy 實現:
- Tab 切換動畫 (scale + opacity)
- Chevron 旋轉動畫 (180deg)
- 欄位展開/收合動畫 (height + opacity)

Next 現狀: **大幅縮減** ⚠️

---

## ✅ 遷移可行性評估

### 總體評估: **高度可行 (85%)**

### 可複用性分析

**100% 直接複用 (無需修改):**
```typescript
✅ parseTenderDetail()        // 資料解析演算法
✅ buildHierarchyUnified()    // 階層建構邏輯
✅ mergeValue()               // 欄位合併邏輯
✅ findTargetRecord()         // 記錄匹配演算法
✅ processFields()            // 欄位處理邏輯
✅ formatDate()               // 日期格式化
✅ All TypeScript Interfaces  // 資料結構定義
```

**需適配 (中等難度):**
```typescript
⚠️ React Router -> Next.js App Router
⚠️ CSR Hook (useEffect) -> SSR Server Component
⚠️ sessionStorage -> URL Params / Cookies
⚠️ Framer Motion -> 標記 'use client'
⚠️ URL State Management -> useRouter().replace()
```

### 技術風險評估

| 風險項目 | 風險等級 | 解決方案 | 預估時間 |
|---------|---------|---------|---------|
| SSR/CSR 邊界劃分 | ⭐⭐⭐⭐ 高 | Server Component (資料) + Client Component (互動) | 4-5 小時 |
| SessionStorage 不可用 | ⭐⭐⭐⭐ 高 | 改為 URL Params (推薦) 或 Cookies | 2-3 小時 |
| Framer Motion 相容性 | ⭐⭐⭐ 中 | 所有動畫組件標記 'use client' | 1-2 小時 |
| URL State 更新觸發重渲染 | ⭐⭐ 低 | Client State 管理 + window.history | 2 小時 |

---

## ⏰ 工期評估

### 總工期: **6-8 天 (48-64 小時)**

#### Phase 1: 核心功能遷移 (2-3 天)

**Day 1 (8 小時)**
- [ ] 複製業務邏輯層 (`parseTenderDetail`, `buildHierarchy` 等)
- [ ] 建立 Next.js 路由結構 (`app/tender/detail/[tenderId]/page.tsx`)
- [ ] 實作 Server Component 資料獲取
- [ ] 實作 `generateMetadata()` (SEO)

**Day 2 (8 小時)**
- [ ] 遷移 **FieldRenderer** 組件 (228 行) - 核心優先
- [ ] 遷移 **FieldRendererProvider** (Context)
- [ ] 遷移 **TenderBasicInfo** 組件
- [ ] 實作 Server/Client 組件拆分

**Day 3 (8 小時)**
- [ ] 遷移 **TenderHeader** 組件
- [ ] 遷移 **TenderTabNavigation** (+ 圖標映射)
- [ ] 遷移 **TenderSpecialInfo** (CommitteeCard 完整版)
- [ ] 實作 URL State 管理

#### Phase 2: UI/UX 完善 (2-3 天)

**Day 4 (8 小時)**
- [ ] 恢復所有 Framer Motion 動畫
- [ ] 調整樣式系統 (Tailwind CSS)
- [ ] 實作 Suspense + `loading.tsx`
- [ ] 實作 Error Boundary (`error.tsx`)

**Day 5 (8 小時)**
- [ ] SessionStorage -> URL Params 轉換
- [ ] BackButton 導航邏輯調整
- [ ] Analytics 整合 (GA 事件追蹤)
- [ ] 響應式設計優化

**Day 6 (8 小時)**
- [ ] 效能優化 (dynamic import, code splitting)
- [ ] 快取策略調整 (fetch cache, revalidate)
- [ ] 跨瀏覽器測試
- [ ] 無障礙性 (a11y) 優化

#### Phase 3: 測試與驗收 (1-2 天)

**Day 7 (8 小時)**
- [ ] 功能完整性測試 (對照 Legacy 逐項驗證)
- [ ] UI/UX 一致性測試
- [ ] SEO 驗證 (Lighthouse, Google Search Console)
- [ ] 效能測試 (Core Web Vitals)

**Day 8 (4 小時)**
- [ ] Bug 修復
- [ ] Code Review
- [ ] 文檔撰寫
- [ ] 部署準備

### 信心區間

- **樂觀估計** (一切順利): 6 天
- **現實估計** (正常開發): 7 天
- **保守估計** (遇到阻礙): 8-10 天

---

## 📂 需要更改的檔案清單

### 新增檔案 (Next 專案)

```
next/
├── app/
│   └── tender/
│       └── detail/
│           └── [tenderId]/
│               ├── page.tsx                    # ✨ Server Component (SSR)
│               ├── loading.tsx                 # ✨ Suspense Fallback
│               └── error.tsx                   # ✨ Error Boundary
│
├── src/
│   ├── components/
│   │   └── tender/
│   │       ├── TenderDetailClient.tsx          # ✨ Client 主容器
│   │       ├── FieldRenderer.tsx               # ✨ 228 行核心組件
│   │       ├── FieldRendererProvider.tsx       # ✨ Context Provider
│   │       ├── TenderBasicInfo.tsx             # ✨ 基本資訊區段
│   │       ├── TenderSpecialInfo.tsx           # ✨ 特殊資訊區段
│   │       ├── CommitteeCard.tsx               # ✨ 評選委員卡片 (完整版)
│   │       └── ComplaintUnitCard.tsx           # ✨ 申訴單位卡片
│   │
│   ├── lib/
│   │   └── tender/
│   │       ├── parseTenderDetail.ts            # ✨ 資料解析邏輯
│   │       ├── buildHierarchyUnified.ts        # ✨ 階層建構
│   │       ├── fetchTenderDetail.ts            # ✨ Server fetch
│   │       └── types.ts                        # ✨ TypeScript 介面
│   │
│   └── hooks/
│       └── useTenderDetailClient.ts            # ✨ Client 狀態管理 Hook
```

### 修改檔案 (Next 專案)

```
next/
├── src/
│   ├── components/
│   │   └── tender/
│   │       ├── TenderHeader.tsx                # 🔧 完善功能按鈕
│   │       └── TenderTabNavigation.tsx         # 🔧 恢復圖標 + 動畫
│   │
│   └── lib/
│       └── utils/
│           ├── formatDate.ts                   # 🔧 可能需調整格式
│           └── analytics.ts                    # 🔧 新增 tender detail 事件
```

---

## 🚀 快速開始

### 1. 閱讀文檔

**建議閱讀順序:**
1. 本文檔 `README.md` (你正在閱讀)
2. `explore-analysis/ANALYSIS_SUMMARY.txt` - 快速參考
3. `explore-analysis/MIGRATION_GUIDE.md` - 實施指南

### 2. 環境準備

```bash
# 確認 Next.js 版本 (建議 14+)
cd next/
npm list next

# 安裝必要依賴
npm install framer-motion

# 確認 TypeScript 嚴格模式
# 檢查 tsconfig.json
```

### 3. 啟動 Formula 自動化遷移 (推薦)

**使用 formula-auto-planning 規劃:**

```bash
# 1. 建立 FORMULA.md
# 內容: "將 Legacy 標案詳情頁的完整 UI/UX 遷移到 Next 專案"

# 2. 呼叫 formula-auto-planning
# 它會讀取本文檔和 execution-analysis/formula-analysis.md
# 自動生成 WorkflowFormula + ImplementationFormula

# 3. 呼叫 formula-auto-execution
# 根據公式自動實施遷移
```

**優勢:**
- ✅ 零監督失控 (公式化驗證)
- ✅ 零重工爆炸 (雙向公式比對)
- ✅ 自動化迭代 (無需人工干預)

### 4. 手動遷移 (替代方案)

**按照 Phase 1-3 逐步實施:**
1. 參考 `explore-analysis/MIGRATION_GUIDE.md`
2. 從 Legacy 複製核心邏輯
3. 適配 Next.js 架構
4. 測試驗證

---

## 🎯 關鍵注意事項

### 1. Server/Client Component 邊界 (最重要)

**黃金法則:**
```typescript
// ❌ 錯誤: Server Component 使用 Client 特性
export default async function TenderDetailPage() {
  const [tab, setTab] = useState(''); // ❌ 不能用 useState
  return <div onClick={() => {}}></div>; // ❌ 不能用事件處理
}

// ✅ 正確: 拆分 Server/Client
export default async function TenderDetailPage({ params }) {
  const data = await fetchTenderDetail(params.tenderId); // ✅ Server 獲取資料
  return <TenderDetailClient data={data} />; // ✅ 傳給 Client Component
}
```

**檢查清單:**
- [ ] 所有使用 `useState`, `useEffect`, `useContext` 的組件標記 `'use client'`
- [ ] 所有使用事件處理的組件標記 `'use client'`
- [ ] 所有使用 Framer Motion 的組件標記 `'use client'`
- [ ] Server Component 僅負責資料獲取與靜態渲染

### 2. SessionStorage 替代方案

**推薦: URL Params**
```typescript
// 從 Tender Search 頁面導航時帶上參數
<Link href={`/tender/detail/${tenderId}?date=${record.date}&type=${record.brief.type}`}>
  查看詳情
</Link>

// Server Component 讀取
export default async function TenderDetailPage({ params, searchParams }) {
  const targetRecord = findTargetRecord(
    data.records,
    searchParams.date ? parseInt(searchParams.date) : undefined,
    searchParams.type
  );
}
```

**優勢:**
- ✅ SSR 可存取
- ✅ 可分享、可書籤
- ✅ 無需額外儲存

### 3. 動畫效能優化

**Framer Motion 最佳實踐:**
```typescript
'use client'
import { motion } from 'framer-motion';

// ✅ 使用 transform 而非 width/height (避免 reflow)
<motion.div
  animate={{ scale: 1.05 }} // ✅ GPU 加速
  transition={{ duration: 0.2 }}
/>

// ❌ 避免動畫大型列表
{fields.map(field => (
  <motion.div key={field.key} animate={{ opacity: 1 }}>
    {/* 如果 fields 有 100+ 項，會影響效能 */}
  </motion.div>
))}
```

---

## 📊 預期成果

### 遷移前後對比

**遷移前 (Next 簡陋版):**
- UI/UX 完整性: **5/10**
- 功能豐富度: **6/10**
- SEO 友善度: **8/10**
- 首屏載入速度: **7/10**

**遷移後 (Next 完整版):**
- UI/UX 完整性: **9/10** ⬆️ +80%
- 功能豐富度: **9/10** ⬆️ +50%
- SEO 友善度: **10/10** ⬆️ +25%
- 首屏載入速度: **9/10** ⬆️ +29%

### 用戶體驗提升

**智能內容識別:**
- ✅ 電話號碼自動連結撥打
- ✅ Email 自動開啟郵件客戶端
- ✅ 網址自動轉換為超連結
- ✅ 地址自動開啟地圖

**視覺引導:**
- ✅ 12 種頁籤圖標清晰標示
- ✅ 動畫過渡流暢自然
- ✅ 展開/收合互動直觀

**SEO 優化:**
- ✅ 伺服器端渲染完整 HTML
- ✅ 動態 metadata (標題、描述、OG)
- ✅ 首屏載入速度提升

---

## 📝 下一步行動

### 立即啟動 (推薦)

**使用 Formula 自動化流程:**

1. **確認文檔已就緒** ✅
   - `explore-analysis/` - 詳細分析完成
   - `execution-analysis/formula-analysis.md` - Formula 解析完成
   - 本文檔 - 總結完成

2. **建立 FORMULA.md**
   ```markdown
   # 業務增量: 標案詳情頁完整 UI/UX 遷移

   將 legacy/src/pages/TenderDetail.tsx 的完整 UI/UX 實現遷移到
   next/app/tender/detail/[tenderId]，確保:

   1. FieldRenderer (228 行) 智能內容識別功能完整遷移
   2. 12 種頁籤圖標映射完整恢復
   3. Framer Motion 動畫效果完整保留
   4. CommitteeCard 完整版資訊展示
   5. SSR 架構下的最佳實踐 (Server/Client 組件拆分)
   6. SessionStorage -> URL Params 轉換
   7. SEO 優化 (generateMetadata)

   技術約束:
   - Next.js 14+ App Router
   - TypeScript 嚴格模式
   - Tailwind CSS 樣式系統
   - Framer Motion 動畫
   ```

3. **啟動 formula-auto-planning**
   ```
   呼叫 formula-auto-planning Agent
   -> 讀取 FORMULA.md + 本文檔 + formula-analysis.md
   -> 生成 WorkflowFormula + ImplementationFormula
   -> 輸出到 .claude/formula/workflow/formula-auto-planning.json
   ```

4. **啟動 formula-auto-execution**
   ```
   呼叫 formula-auto-execution Agent
   -> 讀取 formula-auto-planning.json
   -> 雙向公式轉換與驗證
   -> 自動實施遷移
   -> 零監督失控保證
   ```

### 手動遷移 (替代方案)

如果選擇手動遷移:

1. **閱讀完整文檔** (1-2 小時)
   - `explore-analysis/tender_detail_analysis.md`
   - `explore-analysis/MIGRATION_GUIDE.md`
   - `execution-analysis/formula-analysis.md`

2. **按照 Phase 1-3 執行** (6-8 天)
   - 參考工期評估章節
   - 使用檔案清單章節
   - 遵循注意事項章節

3. **持續驗證**
   - 每完成一個組件立即測試
   - 對照 Legacy 版本逐項驗證
   - 使用 Lighthouse 測試 SEO 與效能

---

## 🔗 相關資源

### 內部文檔

- **Explore 分析文檔**: `explore-analysis/`
  - 詳細技術對比
  - 組件樹狀結構
  - 逐步遷移指南

- **Execution Formula 解析**: `execution-analysis/formula-analysis.md`
  - 數學公式化分析
  - 遷移路徑公式
  - 人話解釋

### 外部參考

- [Next.js App Router 文檔](https://nextjs.org/docs/app)
- [Server Components 指南](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Framer Motion 文檔](https://www.framer.com/motion/)
- [Tailwind CSS 文檔](https://tailwindcss.com/docs)

---

## 📞 支援

如有任何問題或需要協助，請:

1. 優先參考本文檔和子文檔
2. 查閱 `explore-analysis/MIGRATION_GUIDE.md` 的故障排除章節
3. 使用 formula-auto-execution 的自動化修復能力

---

**祝遷移順利！期待 Next 專案完整繼承 Legacy 的優秀 UI/UX！** 🚀

---

## 📜 變更日誌

### 2025-11-02
- ✅ 初始文檔建立
- ✅ Explore Agent 深度分析完成 (5 份文檔，2,180+ 行)
- ✅ Execution Agent Formula 解析完成
- ✅ 遷移可行性評估完成 (85% 高度可行)
- ✅ 文檔結構整理完成 (`explore-analysis/` + `execution-analysis/`)
