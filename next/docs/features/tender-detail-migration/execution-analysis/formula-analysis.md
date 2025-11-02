# 標案詳情頁 Formula 深度解析

> 本文檔由 formula-auto-execution Agent 生成，提供標案詳情頁的數學公式化分析與遷移路徑

## 目錄

- [1. 程式碼轉 Formula - WorkflowFormula](#1-程式碼轉-formula---workflowformula)
- [2. Formula 解釋 - 人話翻譯](#2-formula-解釋---人話翻譯)
- [3. 架構特性提取](#3-架構特性提取)
- [4. 遷移可行性公式 (MigrationFormula)](#4-遷移可行性公式-migrationformula)

---

## 1. 程式碼轉 Formula - WorkflowFormula

### 1.1 整體架構公式

```
TenderDetailPage = RouteEntry -> DataFlow -> RenderFlow -> InteractionFlow

RouteEntry = Route("/tender/detail/:tenderId") -> TenderDetail(Component)

DataFlow = ParamsExtraction -> DataFetch -> DataTransform -> StateManagement

RenderFlow = LoadingState | ErrorState | SuccessState

InteractionFlow = TabNavigation × UserTracking × SEO × SessionPersistence
```

### 1.2 資料流公式 (DataFlow)

```
DataFlow = useTenderDetail(tenderId) -> {Data, TargetRecord, Sections, Loading, Error}

DataFetch =
  SessionStorage(tenderId_context) ->
  APIRequest(unit_id + job_number) ->
  APIResponse(TenderDetail)

DataTransform =
  RecordMatching(date + type) ->
  DetailParsing(record.detail) ->
  HierarchyBuilding(nested_structure) ->
  SectionGeneration(Section[])

RecordMatching =
  (sessionStorage_date & sessionStorage_type) -> exactMatch(records) |
  (sessionStorage_date) -> dateMatch(records) |
  (~sessionStorage) -> latestRecord(records[records.length - 1])

DetailParsing =
  KeySplitting(":") ->
  HierarchyBuilding(buildHierarchyUnified) ->
  FieldProcessing(processFields) ->
  Section[]

HierarchyBuilding =
  RecursiveKeyParsing ×
  DuplicateFieldMerging(mergeValue) ×
  NestedStructureBuilding
```

### 1.3 渲染流公式 (RenderFlow)

```
RenderFlow = StateRouter(isLoading, error, data) -> ComponentTree

StateRouter =
  (isLoading === true) -> InlineLoading |
  (error || !data) -> NoDataFound |
  (data) -> SuccessRender

SuccessRender =
  SEOHead(metadata) ->
  BackButton(navigation) ->
  TenderHeader(summary) ->
  TenderTabNavigation(sections) ->
  ActiveTabContent(renderSection) ->
  DataSource(attribution)

ComponentTree =
  TenderHeader{
    targetRecord.brief.title +
    targetRecord.date +
    targetRecord.brief.type +
    data.unit_name +
    ActionButtons(報告生成 + 追蹤 + 下載)
  } +
  TenderTabNavigation{
    Sections.map(tab_with_icon) +
    ActiveState(URL_sync) +
    MotionAnimation(framer-motion)
  } +
  ContentRenderer{
    (section.title === "最有利標") -> TenderSpecialInfo(committee_cards) |
    (section.title === "其他") -> TenderSpecialInfo(complaint_units) |
    (~special_section) -> TenderBasicInfo(field_renderer)
  }

TenderBasicInfo =
  SectionCard{
    Header(section.title) +
    FieldGrid(adaptive_layout) +
    FieldRendererProvider{
      Context(expandedFields) +
      FieldRenderer(recursive_rendering)
    }
  }

FieldRenderer =
  RecursiveComponent{
    FieldType(basic | nested | array_of_objects) ->
    ValueFormatting(phone | email | url | address | multiline) ->
    ExpandableControl(chevron_animation) ->
    ChildrenRecursion(depth + 1)
  }
```

### 1.4 互動流公式 (InteractionFlow)

```
InteractionFlow = TabManagement × Analytics × SEO × SessionSync

TabManagement =
  URLParams(tab) <->
  ActiveState(setActiveTab) <->
  SectionValidation(isValidTab)

TabChange =
  UserClick(tab_button) ->
  URLEncode(tab_name) ->
  setSearchParams({tab: encodedTab}, {replace: true}) ->
  StateUpdate(setActiveTab) ->
  Analytics(trackEvent)

URLSync =
  useEffect(searchParams) ->
  TabValidation(sections) ->
  FallbackDefault(sections[0]) ->
  StateUpdate

Analytics =
  PageView(SitemapCollector.recordTenderVisit) +
  EventTracking(trackEvent("tender_detail_tab_change"))

SEO =
  DynamicTitle(targetRecord.brief.title + "標案資訊") +
  DynamicDescription(unit_name + brief_summary) +
  CanonicalURL(/tender/detail/${tenderId})

SessionPersistence =
  BackButton{
    returnPath: "/tender/search" +
    sessionKey: "tenderSearchParams"
  }
```

### 1.5 狀態管理公式 (StateFlow)

```
StateManagement = LocalState × URLState × SessionState × ContextState

LocalState =
  useState(activeTab: string) +
  useTenderDetail{
    useState(data: TenderDetail | null) +
    useState(targetRecord: TenderRecord | null) +
    useState(isLoading: boolean) +
    useState(error: string | null) +
    useState(sections: Section[])
  }

URLState =
  useSearchParams() <->
  activeTab <->
  handleTabChange

SessionState =
  sessionStorage.getItem(`tenderRecord_${tenderId}`) ->
  {date, type} ->
  RecordMatching

ContextState =
  FieldRendererProvider{
    expandedFields: Record<string, boolean> +
    toggleFieldExpansion: (fieldKey: string) -> void
  }
```

### 1.6 數據結構公式 (DataStructure)

```
CFDS_Analysis = C + F + D + S

C (Code) =
  TenderDetail.tsx (主入口) +
  useTenderDetail.ts (資料邏輯) +
  TenderHeader.tsx (標頭) +
  TenderTabNavigation.tsx (導航) +
  TenderBasicInfo.tsx (基本資訊) +
  TenderSpecialInfo.tsx (特殊資訊) +
  FieldRenderer.tsx (遞迴渲染器)

F (Files) =
  API_Endpoint("https://pcc-api.openfun.app/api/tender") +
  SessionStorage(tenderRecord_${tenderId}) +
  URLParams(tenderId + tab)

D (Data) =
  TenderDetail{
    unit_name: string | null +
    records: TenderRecord[]
  } +
  TenderRecord{
    date: number +
    brief: {type, title, companies} +
    detail: Record<string, any> +
    unit_name: string | null
  } +
  Section{
    title: string +
    fields: FieldValue[]
  } +
  FieldValue{
    label: string +
    value: string | string[] +
    children?: FieldValue[]
  }

S (State) =
  Loading(boolean) +
  Error(string | null) +
  ActiveTab(string) +
  ExpandedFields(Record<string, boolean>) +
  SearchParams(URLSearchParams)
```

---

## 2. Formula 解釋 - 人話翻譯

### 2.1 資料獲取流程 (DataFlow)

**公式:**
```
DataFetch = SessionStorage -> APIRequest -> RecordMatching -> DetailParsing
```

**人話解釋:**

1. **從 URL 取得標案 ID**: 透過 `useParams()` 取得 `tenderId`（格式: `unit_id_job_number`）
2. **檢查 Session 快取**: 從 `sessionStorage` 讀取 `tenderRecord_${tenderId}`，提取 `date` 和 `type` 作為精確匹配條件
3. **拆分 ID 呼叫 API**:
   - 將 `tenderId` 按第一個 `_` 分割成 `unit_id` 和 `job_number`
   - 呼叫 API: `https://pcc-api.openfun.app/api/tender?unit_id={unit_id}&job_number={job_number}`
4. **精確匹配目標記錄**:
   - 優先: 同時匹配 `date` 和 `type`
   - 次要: 只匹配 `date`
   - 兜底: 取最新一筆記錄（`records[records.length - 1]`）
5. **解析巢狀資料**:
   - 將 `detail` 物件的 key（格式: `區段:子區段:欄位`）拆解成階層結構
   - 使用 `buildHierarchyUnified` 遞迴建立樹狀結構
   - 使用 `mergeValue` 合併重複欄位（葉值優先排序）
6. **生成 Section 陣列**: 將階層結構轉換成扁平的 Section 陣列供 UI 渲染

### 2.2 組件渲染邏輯 (RenderFlow)

**公式:**
```
RenderFlow = LoadingState | ErrorState | SuccessRender{Header + Tabs + Content}
```

**人話解釋:**

**階段一: 狀態路由**
- Loading 時: 顯示 `InlineLoading` 骨架屏
- Error 或無資料時: 顯示 `NoDataFound` 錯誤頁
- 成功時: 進入完整渲染流程

**階段二: 完整渲染結構**

1. **SEO 優化 (SEOHead)**
   - 動態標題: `{標案名稱} - 標案資訊 | 企業放大鏡™`
   - 動態描述: 包含標案名稱、招標機關
   - Canonical URL: `/tender/detail/{tenderId}`

2. **導航控制 (BackButton)**
   - 返回路徑: `/tender/search`
   - Session 恢復: 從 `tenderSearchParams` 恢復搜尋狀態

3. **頁面標頭 (TenderHeader)**
   - 顯示: 標案名稱、公告日期、公告類型、招標機關
   - 動作按鈕: 洞察報告生成、加入追蹤、下載報表

4. **頁籤導航 (TenderTabNavigation)**
   - 動態生成: 根據 `sections` 陣列生成頁籤
   - 圖標映射: 根據 section.title 匹配對應圖標（Building2, Users, FileText 等）
   - 動畫效果: Framer Motion 的 scale 動畫
   - 狀態同步: activeTab <-> URL params

5. **內容渲染 (renderSection)**
   - **特殊處理 - 最有利標**: 使用 `CommitteeCard` 渲染評選委員卡片
   - **特殊處理 - 其他**: 使用 `ComplaintUnitCard` 渲染申訴單位資訊
   - **一般處理**: 使用 `TenderBasicInfo` + `FieldRenderer` 遞迴渲染

6. **資料來源標註 (DataSource)**
   - 標註資料來源: 政府電子採購網、標案瀏覽 API

### 2.3 狀態管理機制 (StateFlow)

**公式:**
```
StateManagement = LocalState × URLState × SessionState × ContextState
```

**人話解釋:**

**1. Local State (useState)**
- `activeTab`: 當前啟用的頁籤（與 URL 同步）
- `data`: API 回傳的完整標案資料
- `targetRecord`: 精確匹配的目標記錄
- `isLoading`: 載入狀態
- `error`: 錯誤訊息
- `sections`: 解析後的區段陣列

**2. URL State (useSearchParams)**
- 透過 `?tab=xxx` 控制當前頁籤
- 頁籤切換時使用 `replace: true` 避免歷史堆疊
- 頁籤值需 URL 編碼處理中文

**3. Session State (sessionStorage)**
- 儲存: `tenderRecord_{tenderId}` -> `{date, type}`
- 用途: 精確匹配多版本標案記錄（招標公告、決標公告等）

**4. Context State (FieldRendererProvider)**
- `expandedFields`: 紀錄每個欄位的展開/收合狀態
- `toggleFieldExpansion`: 切換展開狀態
- 用途: 跨層級共享展開狀態，避免 prop drilling

### 2.4 使用者互動模式 (InteractionFlow)

**公式:**
```
InteractionFlow = TabClick -> URLUpdate -> StateUpdate -> Analytics
```

**人話解釋:**

**1. 頁籤切換流程**
```
使用者點擊頁籤 ->
驗證頁籤有效性（是否存在於 sections） ->
URL 編碼頁籤名稱 ->
更新 URL params (replace mode) ->
更新 activeTab state ->
觸發 GA 事件追蹤
```

**2. 欄位展開/收合**
```
使用者點擊欄位標題 ->
生成 fieldKey (parentKey-label) ->
Context.toggleFieldExpansion(fieldKey) ->
更新 expandedFields state ->
觸發 Framer Motion 動畫 (chevron 旋轉 + 內容展開)
```

**3. 分析追蹤**
- 頁面訪問: `SitemapCollector.recordTenderVisit(tenderId)` (用於生成 sitemap)
- 頁籤切換: `trackEvent('tender_detail_tab_change', {tab})`

**4. Session 恢復**
- BackButton 返回時自動恢復搜尋頁的篩選條件

---

## 3. 架構特性提取

### 3.1 關鍵設計模式

**1. Recursive Component Pattern (遞迴組件模式)**
```
FieldRenderer = Self-Referencing Component
應用: FieldRenderer 遞迴渲染巢狀資料結構
優點: 支援無限層級的資料展示
```

**2. Provider-Consumer Pattern (Context 模式)**
```
FieldRendererProvider -> ExpandContext -> FieldRenderer
應用: 跨層級共享展開狀態
優點: 避免 prop drilling，統一狀態管理
```

**3. Custom Hook Pattern (自定義 Hook 模式)**
```
useTenderDetail = Data Fetching + Parsing + State Management
應用: 封裝複雜的資料處理邏輯
優點: 關注點分離，可重用性
```

**4. Adaptive Rendering Pattern (條件渲染模式)**
```
renderSection = (section.title) -> SpecialRenderer | DefaultRenderer
應用: 根據 section 類型選擇不同渲染器
優點: 靈活處理特殊資料格式
```

**5. URL State Sync Pattern (URL 狀態同步模式)**
```
URLParams <-> activeTab <-> UI
應用: 頁籤狀態與 URL 雙向綁定
優點: 支援書籤、分享、瀏覽器前後退
```

### 3.2 框架特定實現 (React/Vite 專屬)

**React Router 依賴:**
- `useParams()`: 提取路由參數
- `useSearchParams()`: 管理 URL query params
- `Routes/Route`: 路由配置

**React 生態依賴:**
- `useState`, `useEffect`: 狀態與副作用管理
- `createContext`, `useContext`: Context API

**Framer Motion 動畫:**
- `motion.div`: 動畫包裝器
- `initial/animate/exit`: 入場/持續/離場動畫
- `whileHover/whileTap`: 互動動畫

**React Helmet Async:**
- `<SEOHead>`: 動態修改 HTML head

**Vite 特性:**
- ES Modules 導入
- 開發時熱更新 (HMR)

### 3.3 可跨框架遷移的業務邏輯

**核心演算法 (Framework Agnostic):**

1. **資料解析邏輯 (`parseTenderDetail`)**
   - 輸入: `Record<string, any>`
   - 輸出: `Section[]`
   - 演算法: Key splitting + Hierarchy building + Field merging
   - **可遷移性**: 100% (純 JavaScript 邏輯)

2. **階層建構邏輯 (`buildHierarchyUnified`)**
   - 遞迴建構樹狀結構
   - **可遷移性**: 100% (純函數式邏輯)

3. **欄位合併邏輯 (`mergeValue`)**
   - 處理重複欄位的智能合併
   - **可遷移性**: 100% (純邏輯)

4. **記錄匹配演算法 (`findTargetRecord`)**
   - 精確匹配邏輯: date + type -> date -> latest
   - **可遷移性**: 100%

**資料結構定義 (Framework Agnostic):**
- `TenderDetail`, `TenderRecord`, `Section`, `FieldValue` 介面
- **可遷移性**: 100% (TypeScript interfaces)

**業務規則 (Framework Agnostic):**
- 特殊區段處理規則 (`最有利標`, `其他`)
- 欄位格式化規則 (電話、Email、網址、地址)
- **可遷移性**: 90% (需適配不同 UI 框架的 JSX)

---

## 4. 遷移可行性公式 (MigrationFormula)

### 4.1 Legacy -> Next.js (SSR) 轉換公式

```
MigrationFormula = DirectMapping + AdaptationLayer + TechnicalBarriers

DirectMapping = BusinessLogic + DataStructure + APIIntegration

AdaptationLayer = ReactRouter -> NextRouter + CSR -> SSR + StateManagement

TechnicalBarriers = DynamicImport + ContextAPI -> ServerComponent + Animation
```

### 4.2 詳細轉換對應表

#### 4.2.1 直接對應 (1:1 Mapping)

| Legacy 實現 | Next.js 等價實現 | 轉換難度 |
|------------|-----------------|---------|
| `useTenderDetail.ts` 資料邏輯 | Server Component 的 `fetch()` 或 Client Hook | ⭐ 低 |
| `parseTenderDetail()` 演算法 | 相同函數直接複用 | ⭐ 極低 |
| TypeScript 介面定義 | 相同介面直接複用 | ⭐ 極低 |
| API 呼叫邏輯 | Next.js `fetch()` with cache | ⭐ 低 |
| `formatDate()` 工具函數 | 相同工具函數直接複用 | ⭐ 極低 |

#### 4.2.2 需要改寫 (Adaptation Needed)

| Legacy 實現 | 改寫策略 | 轉換難度 |
|------------|---------|---------|
| **React Router** | | |
| `useParams<{tenderId}>()` | Next.js `params` prop (App Router) | ⭐⭐ 中 |
| `useSearchParams()` | `searchParams` prop + `useSearchParams()` hook | ⭐⭐ 中 |
| `<Route path="/tender/detail/:tenderId">` | `app/tender/detail/[tenderId]/page.tsx` | ⭐ 低 |
| **狀態管理** | | |
| `useState(activeTab)` | Client Component `useState` | ⭐ 低 |
| URL State Sync (`setSearchParams`) | `useRouter().push()` or `usePathname()` | ⭐⭐ 中 |
| **資料獲取** | | |
| `useEffect` + `fetch` (CSR) | Server Component 直接 `await fetch()` (SSR) | ⭐⭐⭐ 高 |
| Client-side Loading State | Suspense + Loading.tsx | ⭐⭐ 中 |
| **動畫** | | |
| Framer Motion (`motion.div`) | Framer Motion (Client Component 標記) | ⭐⭐ 中 |
| Page Transitions | App Router 需額外處理 | ⭐⭐⭐ 高 |
| **SEO** | | |
| `<Helmet>` (React Helmet) | Next.js `metadata` export | ⭐ 低 |
| Dynamic SEO | `generateMetadata()` async function | ⭐⭐ 中 |
| **Session Storage** | | |
| `sessionStorage.getItem()` | 需改為 URL params 或 cookies (SSR 無法存取) | ⭐⭐⭐⭐ 極高 |
| **Context API** | | |
| `FieldRendererProvider` | Client Component with `'use client'` | ⭐ 低 |

#### 4.2.3 技術限制/阻礙 (Technical Barriers)

**1. SSR vs CSR 範式轉換**

```
Legacy CSR Flow:
  User Request -> Empty HTML -> JS Bundle Load -> Client Fetch -> Render

Next.js SSR Flow:
  User Request -> Server Fetch -> Fully Rendered HTML -> Hydration
```

**影響:**
- `useTenderDetail` Hook 需分離成 Server Data Fetching + Client State Management
- `sessionStorage` 無法在 SSR 使用，需改為:
  - URL params (SEO 友善，可書籤)
  - Cookies (伺服器可讀取)
  - Server-side Session (複雜度高)

**轉換策略:**
```typescript
// Legacy: Client-side Hook
const { data, isLoading } = useTenderDetail(tenderId);

// Next.js: Server Component
async function TenderDetailPage({ params }) {
  const data = await fetchTenderDetail(params.tenderId);
  return <TenderDetailClient data={data} />;
}
```

**2. URL State Management 複雜化**

```
Legacy:
  setSearchParams({ tab }, { replace: true }) // 簡單直接

Next.js App Router:
  router.push(`?tab=${tab}`, { scroll: false }) // 觸發完整重新渲染
  或使用 shallow routing (Pages Router only)
```

**影響:**
- 頁籤切換可能觸發不必要的伺服器請求
- 需額外優化避免重複 fetch

**轉換策略:**
- 使用 Client Component 管理頁籤狀態
- 僅主資料使用 SSR，頁籤切換保持 CSR

**3. Framer Motion 與 Server Components 不相容**

```
Problem:
  Server Components 不支援 useState/useEffect
  Framer Motion 依賴 React state

Solution:
  所有使用 Framer Motion 的組件標記 'use client'
```

**影響:**
- 可能失去部分 SSR 優勢
- 需謹慎切分 Server/Client Component 邊界

**4. Dynamic Import 與 Code Splitting 差異**

```
Legacy (Vite):
  自動 code splitting by route

Next.js:
  需手動 dynamic() 或依賴自動優化
```

**轉換策略:**
```typescript
// 動態載入重型組件
const FieldRenderer = dynamic(() => import('./FieldRenderer'), {
  loading: () => <FieldSkeleton />
});
```

### 4.3 遷移路徑建議

**Phase 1: 直接遷移 (1-2 天)**
```
DirectMapping =
  BusinessLogic(100% 複用) +
  DataStructures(100% 複用) +
  UtilFunctions(100% 複用) +
  BasicRouting(簡單替換)
```

**Phase 2: 適配層開發 (3-5 天)**
```
AdaptationLayer =
  ServerComponent(資料獲取) +
  ClientComponent(互動邏輯) +
  MetadataAPI(SEO) +
  URLStateManagement(頁籤同步)
```

**Phase 3: 優化與測試 (2-3 天)**
```
Optimization =
  SuspenseBoundary(載入體驗) +
  CacheStrategy(資料快取) +
  CodeSplitting(效能優化) +
  E2ETest(功能驗證)
```

**總預估時間: 6-10 天**

### 4.4 建議的 Next.js 架構

```
app/
├── tender/
│   └── detail/
│       └── [tenderId]/
│           ├── page.tsx              # Server Component (SSR 主邏輯)
│           ├── loading.tsx           # Suspense Fallback
│           ├── error.tsx             # Error Boundary
│           └── components/
│               ├── TenderDetailClient.tsx    # 'use client' 主容器
│               ├── TenderHeader.tsx          # Server Component
│               ├── TenderTabNavigation.tsx   # 'use client' (互動)
│               ├── TenderBasicInfo.tsx       # 'use client' (動畫)
│               ├── FieldRenderer.tsx         # 'use client' (Context)
│               └── ...

lib/
├── tender/
│   ├── parseTenderDetail.ts         # 純函數 (複用)
│   ├── fetchTenderDetail.ts         # Server-side fetch
│   └── types.ts                     # TypeScript interfaces (複用)
```

**關鍵設計:**
```
page.tsx (Server Component):
  await fetchTenderDetail() ->
  傳遞 data 給 Client Component ->
  <TenderDetailClient data={data} initialTab={searchParams.tab} />

TenderDetailClient.tsx ('use client'):
  接收 SSR data ->
  管理 Client State (activeTab, expandedFields) ->
  渲染互動組件
```

---

## 總結

### Legacy 頁面核心本質 (Formula Essence)

```
TenderDetail =
  DynamicDataFetching(API) ∘
  RecursiveHierarchyParsing(Detail) ∘
  AdaptiveRendering(Sections) ∘
  URLStateSynchronization(Tabs) ∘
  ContextualExpansion(Fields)
```

### 遷移關鍵公式

```
MigrationSuccess =
  BusinessLogic_Reuse(100%) +
  RoutingAdaptation(Medium) +
  StateManagement_Refactor(High) +
  SSR_Optimization(Critical)

CriticalPath =
  SessionStorage -> URLParams (技術阻礙) +
  CSR_Hook -> SSR_ServerComponent (範式轉換) +
  ClientState <-> ServerData (邊界劃分)
```

### 遷移可行性評估: **高度可行 (85%)**

- ✅ 業務邏輯 100% 可複用
- ✅ 資料結構完全一致
- ⚠️ 狀態管理需重構 (CSR -> SSR 混合模式)
- ⚠️ SessionStorage 需改為 URL params
- ⚠️ Framer Motion 需標記 'use client'
- ✅ SEO 優化可大幅提升 (動態 metadata)

---

**本文檔提供完整的 Formula 視角分析，供 formula-auto-planning 和 formula-auto-execution 進行自動化遷移參考。**
