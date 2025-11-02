# 深度分析報告：Legacy vs Next 專案的 /tender/detail/[tender_id] 頁面

## 執行摘要

此報告對比 **Legacy 專案（Vite + React Router）** 和 **Next 專案（Next.js App Router）** 的 `/tender/detail/[tender_id]` 路由實現。Legacy 專案具有**完整、功能豐富的 UI/UX**，而 Next 專案則為**簡陋、功能不完整的版本**。

---

## 一、整體架構對比

### Legacy 專案架構
- **框架**: React 18.3.1 + React Router DOM 6.29.0
- **構建工具**: Vite 7.1.12
- **狀態管理**: React Hooks + Context API
- **路由模式**: 客戶端路由 (Client-Side Routing)
- **渲染模式**: CSR (Client-Side Rendering)
- **進度追蹤**: Sitemap 靜態生成
- **資料獲取**: useEffect Hook 中的直接 API 呼叫

### Next 專案架構
- **框架**: React 18.2.0 + Next.js 14.1.0 (App Router)
- **構建工具**: Next.js 內建構建系統
- **狀態管理**: React Hooks (客戶端)
- **路由模式**: 文件系統路由 (File-System Routing)
- **渲染模式**: SSR (Server-Side Rendering) + ISR
- **元數據生成**: Server-side generateMetadata()
- **資料獲取**: useClient Hook + API Proxy
- **快取機制**: MongoDB 快取層

---

## 二、Legacy 專案的完整實現

### 檔案清單與依賴關係

```
legacy/src/
├── components/tender/
│   ├── TenderDetail.tsx (主組件，23行略)
│   ├── TenderSearch.tsx (搜尋組件)
│   └── detail/
│       ├── TenderHeader.tsx (標案標題與基本資訊)
│       ├── TenderTabNavigation.tsx (頁籤導航，60行)
│       ├── TenderBasicInfo.tsx (基本資訊區塊顯示，45行)
│       ├── TenderSpecialInfo.tsx (特殊資訊組件，210行)
│       └── YesNoSection.tsx (是否欄位區塊)
│   └── detail-components/
│       ├── FieldRenderer.tsx (遞迴欄位渲染器，228行)
│       ├── CommitteeCard.tsx (評選委員卡片，168行)
│       ├── ComplaintUnitCard.tsx (申訴單位卡片)
│       └── FieldRenderer.tsx (核心渲染邏輯)
├── hooks/
│   ├── useTenderDetail.ts (資料獲取與解析，225行)
│   ├── useTenderSearch.ts (搜尋邏輯)
│   └── useGoogleAnalytics.ts (GA 追蹤)
└── pages/
    └── TenderSearchPage.tsx (搜尋頁面)
```

### 關鍵組件層級架構

```
TenderDetail (主容器)
├── SEOHead (Meta 標籤)
├── BackButton (返回按鈕)
├── TenderHeader (標案標題、公告日期、招標機關)
│   └── 3 個操作按鈕（報告、追蹤、下載）
├── TenderTabNavigation (分頁籤導航)
│   └── 12 個分類標籤（機關資料、已公告資料、投標廠商等）
├── 條件渲染區塊
│   ├── TenderBasicInfo (基本資訊)
│   │   └── FieldRendererProvider (Context)
│   │       └── FieldRenderer (遞迴展開式結構)
│   ├── TenderSpecialInfo (特殊資訊)
│   │   ├── TenderBasicInfo (基本資訊)
│   │   ├── CommitteeCard (評選委員卡片)
│   │   └── ComplaintUnitCard (申訴單位卡片)
│   └── YesNoSection (是/否欄位)
└── DataSource (資料來源標註)
```

### Legacy 的 UI/UX 完整性分析

#### 1. **TenderHeader 組件** (72 行)
```typescript
✓ 標案標題 (大型、粗體、灰色)
✓ 公告日期 (Calendar 圖標 + 格式化日期)
✓ 公告類型 (FileText 圖標)
✓ 招標機關 (Building2 圖標)
✓ 3 個操作按鈕 (報告/追蹤/下載，顏色區分)
✓ 按鈕樣式：
  - 報告: 橙色背景 (bg-orange-400 → bg-orange-500)
  - 追蹤: 灰色邊框 (border-gray-300)
  - 下載: 藍色背景 (bg-blue-600 → bg-blue-700)
```

#### 2. **TenderTabNavigation 組件** (60 行)
```typescript
✓ 12 個動態頁籤的圖標映射
✓ Framer Motion 動畫 (whileHover, whileTap)
✓ 漸變背景 (gradient-to-r from-blue-50 to-gray-50)
✓ 活躍狀態樣式：
  - 背景: 白色 + 陰影
  - 文字: 藍色 (text-blue-600)
✓ 懸停效果: scale 1.02
✓ 點擊效果: scale 0.98
```

#### 3. **TenderBasicInfo 組件** (45 行)
```typescript
✓ 漸變標題背景 (from-blue-50 to-gray-50)
✓ 左側藍色縮進線條
✓ 網格佈局 (grid-cols-1 md:grid-cols-2)
✓ 2 種版本配置：
  - 單欄 (投標廠商、決標品項)
  - 雙欄 (其他區塊)
✓ 懸停效果 (hover:bg-gray-100)
✓ FieldRendererProvider 上下文管理
```

#### 4. **FieldRenderer 組件** (228 行) - 核心複雜度最高
```typescript
✓ 遞迴展開式結構 (expandable/collapsible)
✓ Context-based 展開狀態管理
✓ 特殊內容識別 & 智能渲染：
  - 電話號碼: (XXXX)XXXX-XXXX 格式 → Phone 圖標
  - 電子郵件: xxx@xxx.xxx → Mail 圖標 + 可點擊連結
  - URL: https://... → Globe 圖標 + 外部連結
  - 地址: 包含縣市區等關鍵字 → MapPin 圖標
  - 多行文本: \n 分割 → 逐行渲染
✓ 物件陣列處理: 2 列網格 (grid grid-cols-2 gap-4)
✓ 深度指示 (depth-based 樣式)：
  - depth 0: font-medium text-gray-700
  - depth 1: font-normal text-gray-600
  - depth 2+: font-light text-gray-500
✓ 邊框與填充 (depth > 0 時 pl-4 + border-l-2 border-gray-200)
✓ 展開/折疊動畫 (Framer Motion ChevronDown rotate)
✓ 視覺指示: 藍色圓點 (w-3 h-3 bg-blue-100)
```

#### 5. **TenderSpecialInfo 組件** (210 行)
```typescript
✓ 最有利標 評選委員組成
  - CommitteeCard 卡片展示
  - 2 列網格 (grid grid-cols-1 md:grid-cols-2)

✓ 其他資訊區塊
  - 過濾掉疑義/異議/申訴單位欄位
  - 使用 TenderBasicInfo 渲染基本資訊
  - 整合 3 個申訴管道：
    * 採購案件諮詢窗口
    * 政府採購申訴管道
    * 政府採購監督管道
  - 分別渲染 ComplaintUnitCard
```

#### 6. **CommitteeCard 組件** (168 行)
```typescript
✓ 專業經驗解析函數 (parseExperience)
✓ 出席狀態 Badge (是/否 → green/red)
✓ 職業 Badge 陣列 (split by 「；」)
✓ 專業經歷卡片 (gradient-to-br from-gray-50 to-white)
✓ 4 個主要欄位：
  - 姓名 (帶藍色圓點)
  - 出席會議狀態
  - 現任職務 (多個 Badge)
  - 專業領域與相關經歷 (展開式經歷卡片)
  - 評選備註 (藍色背景框)
✓ Hover 效果 (whileHover: y-2)
✓ 動畫延遲 (delay: expIndex * 0.1)
```

#### 7. **useTenderDetail Hook** (225 行)
```typescript
✓ 資料獲取邏輯
  - API: https://pcc-api.openfun.app/api/tender
  - tenderId 解析 (unit_id_job_number)
  - sessionStorage 緩存記錄匹配

✓ 精確記錄匹配
  - 若有 date + type → 精確匹配
  - 若有 date → 日期匹配
  - 否則 → 最後一筆記錄

✓ 複雜資料結構解析
  - mergeValue(): 重複欄位合併
  - buildHierarchyUnified(): 遞迴階層構建
  - parseTenderDetail(): 扁平化為 Section[]

✓ Section 結構
  - title: 區塊名稱
  - fields: FieldValue[] (遞迴結構)
```

#### 8. **TenderDetail 主組件** (174 行)
```typescript
✓ 路由參數解析 (useParams)
✓ 搜尋參數同步 (useSearchParams → tab state)
✓ Google Analytics 追蹤
  - 頁面訪問記錄
  - 標案訪問追蹤 (SitemapCollector)
  - Tab 變更事件

✓ Tab 驗證邏輯
  - decodeURIComponent() 解碼
  - 有效性驗證
  - URL 編碼設定 (replace: true)

✓ SEO 實現
  - 動態標題 (含標案名稱)
  - 動態 description (含招標機關)
  - Canonical URL

✓ 載入狀態處理
  - InlineLoading 組件
  - 錯誤訊息顯示
  - NoDataFound 組件

✓ 全局樣式注入
  - 自定義 scrollbar 樣式
  - webkit 前綴支持
  - 懸停時的不透明度過渡
```

---

## 三、Next 專案的簡陋實現

### 檔案清單

```
next/src/
├── app/tender/detail/[tenderId]/
│   ├── page.tsx (Server Component + Metadata 生成)
│   └── loading.tsx (載入組件)
├── components/tender/
│   ├── TenderDetail.tsx (客戶端組件)
│   ├── TenderDetailTracker.tsx (GA 追蹤)
│   └── detail/
│       ├── TenderHeader.tsx (簡化版)
│       ├── TenderTabNavigation.tsx (簡化版)
│       ├── TenderBasicInfo.tsx (完全重寫)
│       ├── TenderSpecialInfo.tsx (簡化版)
│       └── YesNoSection.tsx
│   └── detail-components/
│       ├── CommitteeCard.tsx (新的簡化版)
│       ├── ComplaintUnitCard.tsx
│       └── FieldRenderer.tsx (缺失！)
├── hooks/
│   └── useTenderDetail.ts (客戶端版，缺少部分邏輯)
└── api/
    └── tender-detail-proxy/
        └── route.ts (API 代理路由)
```

### 簡陋之處 1: TenderBasicInfo 完全重寫

**Legacy 版本** (45 行，複雜)：
- 使用 FieldRendererProvider + FieldRenderer
- 遞迴展開式結構
- 智能內容識別 (電話、郵件、URL、地址)
- 深度感知的樣式

**Next 版本** (78 行，簡陋)：
```typescript
// 直接渲染式，缺少智能識別
const renderFieldValue = (field: FieldValue, depth = 0) => {
  if (field.children && field.children.length > 0) {
    // 簡單的展開/折疊邏輯
    const groupKey = `${field.label}-${depth}`;
    return (
      <button onClick={() => toggleGroup(groupKey)}>
        {isExpanded ? <ChevronDown /> : <ChevronRight />}
        {field.label}
      </button>
    );
  }

  // 沒有 FieldRenderer 的智能識別
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="text-gray-600">{field.label}</div>
      <div className="col-span-2">
        {Array.isArray(field.value) ? field.value.join(', ') : field.value}
      </div>
    </div>
  );
};
```

**缺失功能**:
- ❌ 電話號碼識別 & Phone 圖標
- ❌ 郵件識別 & Mail 圖標 + 可點擊連結
- ❌ URL 識別 & Globe 圖標 + 外部連結
- ❌ 地址識別 & MapPin 圖標
- ❌ 物件陣列的 2 列網格布局
- ❌ FieldRendererProvider Context
- ❌ Framer Motion 動畫

### 簡陋之處 2: TenderTabNavigation 簡化

**Legacy 版本** (60 行)：
- Framer Motion 動畫 (whileHover, whileTap)
- 漸變背景 (gradient-to-r)
- 圖標映射
- 活躍狀態陰影效果

**Next 版本** (88 行)：
```typescript
// 反應式寬度計算：添加複雜性卻減少功能
const [availableWidth, setAvailableWidth] = useState(0);
const shouldUseDropdown = sections.length > maxTabs;

if (shouldUseDropdown) {
  return <select>...</select>; // 簡單 select 下拉
}

// 標籤模式：比 Legacy 更簡陋
<nav className="border-b border-gray-200">
  <button className={`border-b-2 px-6 py-4 text-sm font-medium`}>
    {section.title}
  </button>
</nav>
```

**缺失功能**:
- ❌ 圖標映射 (12 個圖標完全移除)
- ❌ Framer Motion 動畫 (只有簡單 border 變色)
- ❌ 漸變背景
- ❌ 活躍狀態陰影
- ✓ 新增: 響應式寬度計算 (但值得商榷)

### 簡陋之處 3: CommitteeCard 組件

**Legacy 版本** (168 行)：
- parseExperience() 函數解析文本
- 多個 Badge 組件
- 詳細的經歷展開卡片
- 2 列網格 (col-span-2)
- Hover 動畫效果

**Next 版本** (50 行)：
```typescript
// 完全簡化的版本
interface CommitteeMember {
  name: string;
  expertise: boolean;
  field: string;
  experience: string;
}

return (
  <div className="rounded-lg border border-gray-200 bg-white p-4">
    <div className="flex items-center">
      <div className={`p-2 ${member.expertise ? 'bg-green-100' : 'bg-blue-100'}`}>
        <UserRound className="h-5 w-5" />
      </div>
      <h4 className="font-medium">{member.name}</h4>
      <span>{member.expertise ? '專家學者' : '一般委員'}</span>
    </div>
    {member.field && <span className="text-sm">{member.field}</span>}
    {member.experience && <span className="text-sm">{member.experience}</span>}
  </div>
);
```

**缺失功能**:
- ❌ parseExperience() 文本解析
- ❌ 多個 Badge 組件
- ❌ 詳細的經歷卡片 (gradient-to-br)
- ❌ 經歷展開動畫
- ❌ 出席會議狀態 Badge
- ❌ 評選備註欄位
- ❌ 專業領域分類

### 簡陋之處 4: FieldRenderer 組件完全缺失

**Legacy**:
- 228 行的複雜組件
- FieldRendererProvider Context
- 智能內容識別
- 深度感知樣式
- 遞迴展開邏輯

**Next**:
- 🚫 **完全不存在！**
- TenderBasicInfo 內聯簡化邏輯

### 簡陋之處 5: 路由與元數據

**Legacy (Client-Side)**:
```typescript
// App.tsx 中定義
<Route path="tender">
  <Route path="detail/:tenderId" element={<TenderDetail />} />
</Route>

// TenderDetail 內
<SEOHead
  title={seoTitle}
  description={seoDescription}
  canonicalUrl={`/tender/detail/${tenderId}`}
/>
```

**Next (Server-Side)**:
```typescript
// [tenderId]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  // Server-side 生成元數據
  const cachedData = await getCachedApiData(PCC_API_CACHE_COLLECTION, apiKey);
  if (!cachedData) {
    const response = await fetch(apiUrl);
    await setCachedApiData(...);
  }

  return {
    title: dynamicTitles.tenderDetailWithName(...),
    description: `...`,
    alternates: { canonical: `/tender/detail/${tenderId}` }
  };
}
```

✓ 優勢: Server-side 元數據 + MongoDB 快取
❌ 缺點: 複雜性增加，但 UI 組件反而簡化

---

## 四、技術實現細節對比

### 4.1 資料獲取與狀態管理

| 面向 | Legacy | Next |
|------|--------|------|
| API 層 | 直接 fetch 到 `https://pcc-api.openfun.app/api/tender` | API Proxy `/api/tender-detail-proxy` |
| 快取 | sessionStorage (客戶端) | MongoDB (伺服器端) |
| 資料解析 | useTenderDetail Hook 內完成 | useTenderDetail Hook 內完成 |
| 狀態管理 | useState + Context | useState |
| 元數據 | react-helmet | generateMetadata() |
| 分析追蹤 | Google Analytics Hook | TenderDetailTracker 組件 |

### 4.2 組件複雜度

```
Legacy 組件行數分佈:
- TenderDetail: 174 行
- useTenderDetail Hook: 225 行
- FieldRenderer: 228 行 ⭐️ 核心複雜度
- TenderSpecialInfo: 210 行
- CommitteeCard: 168 行
- TenderBasicInfo: 45 行
- TenderTabNavigation: 60 行
- TenderHeader: 72 行

總計: ~1,182 行

Next 組件行數分佈:
- TenderDetail: 168 行 (similar)
- useTenderDetail Hook: 296 行 (similar)
- TenderBasicInfo: 78 行 (+33 行因為移除 FieldRenderer)
- CommitteeCard: 50 行 (-118 行，簡化)
- TenderTabNavigation: 88 行 (+28 行，複雜度轉移)
- TenderHeader: 77 行 (+5 行，minor)
- 缺失: FieldRenderer (-228 行)

總計: ~757 行 (-425 行，-36%)
```

---

## 五、共用組件的依賴分析

### Legacy 的 tender detail 依賴樹

```
TenderDetail
├── Components
│   ├── SEOHead ✓
│   ├── BackButton ✓
│   ├── NoDataFound ✓
│   ├── DataSource ✓
│   ├── InlineLoading ✓
│   └── TenderHeader
│       ├── lucide-react (Building2, FileText, Calendar)
│       └── formatters (formatDate)
│
├── TenderTabNavigation
│   ├── framer-motion ✓
│   ├── lucide-react (11 icons) ✓
│   └── hooks/useTenderDetail (Section type)
│
├── TenderBasicInfo
│   ├── framer-motion ✓
│   ├── FieldRenderer
│   │   ├── lucide-react (Phone, Mail, Globe, MapPin, ChevronDown) ✓
│   │   ├── React Context API
│   │   └── hooks/useTenderDetail (FieldValue type)
│   └── FieldRendererProvider
│
├── TenderSpecialInfo
│   ├── Badge ✓
│   ├── CommitteeCard
│   │   ├── Badge ✓
│   │   ├── framer-motion ✓
│   │   └── lucide-react (icons) ✓
│   └── ComplaintUnitCard
│       ├── Badge ✓
│       ├── framer-motion ✓
│       └── lucide-react (icons) ✓
│
└── Hooks
    ├── useTenderDetail (主要邏輯)
    ├── useGoogleAnalytics (GA 追蹤)
    └── useSearchParams (React Router)

共用組件:
✓ Badge: 在 TenderSpecialInfo, CommitteeCard, ComplaintUnitCard 中多次使用
✓ InlineLoading: 定義在 common/loading/
✓ BackButton: 共用導航組件
✓ DataSource: 顯示資料來源
✓ formatDate: 工具函數
```

### Next 的 tender detail 依賴樹

```
TenderDetailPage (Server)
├── generateMetadata()
│   ├── getCachedApiData (MongoDB)
│   ├── setCachedApiData (MongoDB)
│   └── fetch() to PCC API
│
└── TenderDetail (Client Component)
    ├── 'use client'
    ├── Components
    │   ├── BackButton ✓ (同 Legacy)
    │   ├── TenderDetailTracker (GA)
    │   ├── InlineLoading ✓ (同 Legacy)
    │   └── TenderHeader
    │       ├── lucide-react ✓
    │       └── formatters ✓
    │
    ├── TenderTabNavigation (簡化)
    │   ├── useState (local state)
    │   └── lucide-react (ChevronDown, ChevronRight only)
    │
    ├── TenderBasicInfo (內聯邏輯)
    │   ├── useState (expandedGroups)
    │   ├── lucide-react (ChevronDown, ChevronRight)
    │   └── 無 FieldRenderer
    │
    ├── TenderSpecialInfo (簡化)
    │   ├── CommitteeCard (新版簡化)
    │   │   ├── lucide-react (UserRound, Briefcase, GraduationCap)
    │   │   └── 無詳細經歷卡片
    │   └── ComplaintUnitCard ✓
    │
    └── Hooks
        ├── useTenderDetail (客戶端版)
        └── useRouter (Next.js)

核心差異:
❌ FieldRenderer 完全移除
❌ FieldRendererProvider Context 移除
❌ 詳細的 parseExperience() 邏輯
❌ 圖標映射
❌ Framer Motion 複雜動畫
```

---

## 六、缺失功能清單

### 完全缺失
1. **FieldRenderer 組件** (228 行)
   - 遞迴展開邏輯
   - 智能內容識別
   - 深度感知樣式

2. **FieldRendererProvider Context**
   - 跨組件展開狀態管理

3. **parseExperience() 函數**
   - CommitteeCard 中的文本解析

4. **12 個頁籤圖標映射**
   - 在 TenderTabNavigation 中移除

### 部分簡化
1. **TenderBasicInfo**
   - 從 45 行複雜版 → 78 行簡陋版
   - 失去智能內容識別
   - 失去深度感知樣式

2. **CommitteeCard**
   - 從 168 行 → 50 行
   - 失去詳細經歷展開
   - 失去 Badge 組件
   - 失去動畫效果

3. **TenderTabNavigation**
   - 失去圖標
   - 失去 Framer Motion 動畫
   - 新增響應式寬度計算 (反而增加複雜性)

### 功能改進
1. **元數據生成**: Client-side (Legacy) → Server-side (Next)
2. **快取機制**: sessionStorage (Legacy) → MongoDB (Next)
3. **API 代理**: 直接 fetch (Legacy) → Proxy 路由 (Next)

---

## 七、視覺設計對比

### 顏色與樣式

| 元素 | Legacy | Next |
|------|--------|------|
| Tab 背景 | gradient-to-r from-blue-50 to-gray-50 | 單色白色 |
| Tab 活躍 | bg-white + shadow-lg | border-b-2 border-blue-500 |
| Tab 圖標 | 12 個圖標對應不同類型 | 無圖標 |
| Header 按鈕 | 橙色、灰色邊框、藍色 (3 種) | 同左 |
| FieldRenderer | 藍色圓點 + 深度線條 | 簡單折疊符號 |
| CommitteeCard | Gradient bg + 多色 Badge | 單一背景 + 簡單 Badge |

### 動畫與互動

| 效果 | Legacy | Next |
|------|--------|------|
| Tab Hover | whileHover={{ scale: 1.02 }} | 簡單 hover:text-gray-700 |
| Tab Click | whileTap={{ scale: 0.98 }} | 無 |
| FieldRenderer 展開 | Framer Motion height 動畫 | 直接顯示/隱藏 |
| CommitteeCard | whileHover={{ y: -2 }} | 簡單 hover:shadow-md |
| 經歷卡片 | Framer Motion with delay | 無動畫 |
| Scrollbar | 自定義 webkit 樣式 | 預設樣式 |

---

## 八、API 與資料流

### Legacy 資料流
```
TenderDetail (useParams)
  ↓
useTenderDetail Hook
  ↓
fetch(`https://pcc-api.openfun.app/api/tender?unit_id=${unitId}&job_number=${jobNumber}`)
  ↓
parseTenderDetail() [mergeValue + buildHierarchyUnified + processFields]
  ↓
Section[] (結構化資料)
  ↓
FieldRenderer (遞迴渲染)
```

### Next 資料流
```
URL: /tender/detail/[tenderId]
  ↓
[tenderId]/page.tsx (Server Component)
  ↓
generateMetadata()
  ├─ getCachedApiData (MongoDB)
  ├─ 若無快取 → fetch PCC API
  └─ setCachedApiData (MongoDB)
  ↓
<TenderDetail tenderId={params.tenderId} /> (Client Component)
  ↓
useTenderDetail Hook (useClient)
  ↓
fetch(`/api/tender-detail-proxy?unit_id=${unitId}&job_number=${jobNumber}`)
  ↓
Proxy 路由 → PCC API
  ↓
parseTenderDetail() (相同邏輯)
  ↓
Section[] → TenderBasicInfo (內聯渲染)
```

### 快取對比
- **Legacy**: sessionStorage (瀏覽器本地)，臨時快取，刷新即清
- **Next**: MongoDB (伺服器端)，持久快取 (24h TTL)，減少 API 呼叫

---

## 九、渲染模式對比

### Legacy (CSR - Client-Side Rendering)
```
1. 初始 HTML 加載 (空容器)
2. JavaScript 加載與執行
3. React 應用初始化
4. useParams 獲取 tenderId
5. useEffect 觸發 API 呼叫
6. 資料加載中顯示 InlineLoading
7. 資料返回後渲染完整頁面
```

**優勢**:
- 資料獲取靈活
- 用戶互動響應快速

**劣勢**:
- 首屏渲染慢
- SEO 依賴 Helmet
- 白屏時間長

### Next (SSR + ISR)
```
1. 用戶請求 /tender/detail/[tenderId]
2. 伺服器 generateMetadata() 執行
3. 元資料從 MongoDB 快取獲取 (或 fetch PCC API)
4. 伺服器渲染 HTML (部分內容)
5. 返回 HTML 給客戶端
6. JavaScript hydration
7. 客戶端 useTenderDetail 獲取完整資料
8. 完整頁面渲染
```

**優勢**:
- SEO 友善 (完整元資料)
- 首屏更快 (伺服器預渲染)
- MongoDB 快取減少 API 呼叫

**劣勢**:
- 實際資料仍需客戶端 fetch
- 複雜性更高
- hydration mismatch 風險

---

## 十、代碼質量與可維護性

### Legacy
```
優勢:
✓ 組件單一責任清晰
✓ FieldRenderer 高度可複用
✓ Context 管理狀態集中
✓ Framer Motion 增強 UX
✓ 詳細註解

劣勢:
❌ 客戶端資料獲取，首屏慢
❌ SEO 依賴 Helmet (軟依賴)
❌ 沒有伺服器端快取
```

### Next
```
優勢:
✓ Server-side 元資料生成
✓ MongoDB 伺服器快取
✓ 代碼行數更少 (-36%)
✓ App Router 現代化

劣勢:
❌ FieldRenderer 完全移除
❌ 組件功能簡化太多
❌ 代碼重複性增加
❌ UI/UX 品質下降
❌ 可複用性下降
```

---

## 十一、改進建議

### 立即行動 (High Priority)

1. **復原 FieldRenderer 組件**
   ```typescript
   // next/src/components/tender/detail-components/FieldRenderer.tsx
   // 複製 Legacy 版本 (228 行)
   ```

2. **復原 TenderBasicInfo 原始實現**
   ```typescript
   // 使用 FieldRendererProvider + FieldRenderer
   // 恢復智能內容識別
   ```

3. **恢復 CommitteeCard 詳細版本**
   ```typescript
   // 包含 parseExperience()
   // 恢復詳細經歷卡片
   ```

4. **恢復 TenderTabNavigation 圖標**
   ```typescript
   // 重新添加 tabIcons 映射
   // 恢復 Framer Motion 動畫
   ```

### 次要改進 (Medium Priority)

1. **整合 TenderSpecialInfo 邏輯**
   - 將 CommitteeCard + ComplaintUnitCard 完全實現

2. **優化 API 代理**
   - 確保快取層正確運作

3. **性能測試**
   - 與 Legacy 進行首屏時間、TTI 對比

### 長期優化 (Low Priority)

1. **考慮靜態生成 (SSG)**
   - 使用 generateStaticParams() 預生成常用 tender pages

2. **增量靜態再生 (ISR)**
   - 設置 revalidate 時間

3. **邊界快取 (Edge Caching)**
   - 利用 CDN 加速

---

## 十二、結論

### 總體評估

| 維度 | Legacy | Next | 勝者 |
|------|--------|------|------|
| UI/UX 完整性 | 9/10 | 5/10 | Legacy ⭐️ |
| 功能豐富度 | 9/10 | 6/10 | Legacy ⭐️ |
| 代碼可維護性 | 8/10 | 6/10 | Legacy ⭐️ |
| 性能優化 | 6/10 | 8/10 | Next ⭐️ |
| SEO 友善度 | 7/10 | 9/10 | Next ⭐️ |
| 開發效率 | 8/10 | 7/10 | Legacy ⭐️ |
| 技術現代性 | 6/10 | 9/10 | Next ⭐️ |

### 關鍵發現

1. **Next 專案過度簡化**
   - 移除 FieldRenderer 導致損失 228 行核心邏輯
   - CommitteeCard 簡化 70% (168 → 50 行)
   - 整體 UI/UX 品質下降約 40%

2. **Legacy 優於 Next 的地方**
   - ✓ 遞迴展開式 FieldRenderer
   - ✓ 智能內容識別 (URL、郵件、電話、地址)
   - ✓ Framer Motion 豐富動畫
   - ✓ 圖標映射完整度
   - ✓ CommitteeCard 詳細經歷

3. **Next 優於 Legacy 的地方**
   - ✓ Server-side 元資料生成
   - ✓ MongoDB 伺服器快取機制
   - ✓ API 代理路由
   - ✓ 更現代的 App Router

### 推薦方案

**將 Legacy 的 FieldRenderer 組件遷移到 Next 專案**

```
next/src/components/tender/detail-components/
├── FieldRenderer.tsx (複製自 Legacy，228 行)
├── FieldRendererProvider.tsx (新增)
├── CommitteeCard.tsx (升級回 168 行版本)
├── ComplaintUnitCard.tsx (保持)
└── TenderTabNavigation.tsx (恢復圖標 + 動畫)
```

這樣可以在保留 Next.js 的現代架構優勢的同時，恢復 Legacy 的 UI/UX 完整性。
