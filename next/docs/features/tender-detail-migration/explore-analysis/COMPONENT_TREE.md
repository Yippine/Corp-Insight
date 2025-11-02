# 組件樹狀結構與代碼量分析

## Legacy 專案 - 完整版本

```
TenderDetail (174 行) [主容器]
│
├─ SEOHead (react-helmet)
│  └─ 動態標題 + Meta 描述 + Canonical URL
│
├─ BackButton (共用組件)
│  └─ 返回 /tender/search
│
├─ TenderHeader (72 行)
│  ├─ 標案標題 (h2, text-3xl, font-bold)
│  ├─ Calendar 圖標 + 公告日期
│  ├─ FileText 圖標 + 公告類型
│  ├─ Building2 圖標 + 招標機關
│  └─ 3 個操作按鈕
│      ├─ 一鍵生成洞察報告 (orange)
│      ├─ 加入追蹤 (gray border)
│      └─ 下載報表 (blue)
│
├─ TenderTabNavigation (60 行)
│  ├─ gradient-to-r from-blue-50 to-gray-50
│  ├─ 12 個分類頁籤 + 圖標映射
│  │  ├─ 機關資料 (Building2)
│  │  ├─ 已公告資料 (FileText)
│  │  ├─ 投標廠商 (Users)
│  │  ├─ 決標品項 (FileText)
│  │  ├─ 決標資料 (FileText)
│  │  ├─ 採購資料 (FileText)
│  │  ├─ 招標資料 (FileText)
│  │  ├─ 領投開標 (FileText)
│  │  ├─ 其他 (FileText)
│  │  ├─ 無法決標公告 (FileText)
│  │  ├─ 標案內容 (FileText)
│  │  └─ 最有利標 (Users)
│  └─ Framer Motion: whileHover={{ scale: 1.02 }}, whileTap={{ scale: 0.98 }}
│
├─ 條件渲染區塊 (sections.map())
│  │
│  ├─ TenderBasicInfo (45 行) [常規區塊]
│  │  ├─ gradient header: from-blue-50 to-gray-50
│  │  ├─ FieldRendererProvider (Context)
│  │  │  └─ FieldRenderer (228 行) ⭐️ 核心複雜度
│  │  │     │
│  │  │     ├─ Context Hook: { expandedFields, toggleFieldExpansion }
│  │  │     │
│  │  │     ├─ renderFieldValue() [智能內容識別]
│  │  │     │  ├─ 電話號碼: /^\(\d{2,4}\)[0-9\-#]+$/ 
│  │  │     │  │  └─ Phone 圖標 + (XXX)XXXX-XXXX 格式
│  │  │     │  │
│  │  │     │  ├─ 電子郵件: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
│  │  │     │  │  └─ Mail 圖標 + <a href="mailto:">可點擊連結</a>
│  │  │     │  │
│  │  │     │  ├─ URL: startsWith("http")
│  │  │     │  │  └─ Globe 圖標 + <a href="">外部連結</a>
│  │  │     │  │
│  │  │     │  ├─ 地址: /[縣市區鄉鎮路街]/
│  │  │     │  │  └─ MapPin 圖標 + 地址顯示
│  │  │     │  │
│  │  │     │  ├─ 多行文本: includes("\n")
│  │  │     │  │  └─ split("\n").map() 逐行渲染
│  │  │     │  │
│  │  │     │  └─ 數組型態
│  │  │     │     └─ value.map() + ", ".join()
│  │  │     │
│  │  │     ├─ 遞迴展開邏輯
│  │  │     │  ├─ 深度 0: font-medium text-gray-700 (藍色圓點)
│  │  │     │  ├─ 深度 1: font-normal text-gray-600 (藍色圓點)
│  │  │     │  └─ 深度 2+: font-light text-gray-500 (藍色圓點)
│  │  │     │
│  │  │     ├─ 邊框與填充
│  │  │     │  ├─ depth > 0: pl-4 + border-l-2 border-gray-200
│  │  │     │  └─ mb-4 (每個欄位之間的空距)
│  │  │     │
│  │  │     ├─ ChevronDown 動畫
│  │  │     │  └─ Framer Motion: animate={{ rotate: isExpanded ? 180 : 0 }}
│  │  │     │
│  │  │     └─ 物件陣列特殊處理
│  │  │        └─ grid grid-cols-2 gap-4 (投標廠商、決標品項用)
│  │  │
│  │  └─ grid grid-cols-1 md:grid-cols-2 (2 種配置)
│  │     ├─ 單欄: 投標廠商、決標品項
│  │     └─ 雙欄: 其他區塊
│  │
│  ├─ TenderSpecialInfo (210 行) [特殊區塊: 最有利標 + 其他]
│  │  │
│  │  ├─ 最有利標 分支
│  │  │  ├─ 評選委員組成 副標題
│  │  │  │  └─ grid grid-cols-1 md:grid-cols-2 gap-4
│  │  │  │
│  │  │  └─ CommitteeCard[].map() (168 行)
│  │  │     │
│  │  │     ├─ 出席狀態 Badge
│  │  │     │  ├─ 是 → green badge "已出席"
│  │  │     │  └─ 否 → red badge "未出席"
│  │  │     │
│  │  │     ├─ 名稱 (h4, font-semibold, 藍色圓點)
│  │  │     │
│  │  │     ├─ 現任職務 (Grid col-span-1)
│  │  │     │  └─ split("；") → Purple Badge[] (hover:scale-105)
│  │  │     │
│  │  │     ├─ 專業領域與相關經歷 (Grid col-span-2)
│  │  │     │  └─ parseExperience() [文本解析]
│  │  │     │     ├─ 正則解析: /經歷\d+：/
│  │  │     │     ├─ 提取 3 個字段:
│  │  │     │     │  ├─ 服務機關(構)名稱 (Blue Badge)
│  │  │     │     │  ├─ 職稱 (Purple Badge)
│  │  │     │     │  └─ 所任工作 (Green Badge)
│  │  │     │     │
│  │  │     │     └─ 經歷卡片 (gradient-to-br from-gray-50 to-white)
│  │  │     │        └─ Framer Motion with delay: expIndex * 0.1
│  │  │     │
│  │  │     └─ 評選備註 (col-span-2)
│  │  │        └─ bg-blue-50 p-4 border border-blue-100
│  │  │
│  │  └─ 其他資訊 分支
│  │     ├─ 過濾 "疑義、異議、申訴及檢舉受理單位" 欄位
│  │     │
│  │     ├─ TenderBasicInfo (基本資訊)
│  │     │
│  │     └─ 3 個申訴管道
│  │        │
│  │        ├─ 採購案件諮詢窗口 [疑義/異議]
│  │        │  ├─ Users 圖標
│  │        │  └─ 主辦機關單位 Badge (blue solid)
│  │        │
│  │        ├─ 政府採購申訴管道 [申訴]
│  │        │  └─ ComplaintUnitCard[].map()
│  │        │     ├─ 名稱
│  │        │     ├─ 電話 (Phone 圖標)
│  │        │     ├─ 地址 (MapPin 圖標)
│  │        │     └─ 傳真 (Phone 圖標)
│  │        │
│  │        └─ 政府採購監督管道 [檢舉]
│  │           └─ ComplaintUnitCard[].map()
│  │
│  └─ YesNoSection (隱藏) [是/否欄位特殊渲染]
│
├─ DataSource (共用組件)
│  ├─ 政府電子採購網
│  └─ 標案瀏覽
│
└─ Hooks & Logic
   ├─ useTenderDetail (225 行)
   │  ├─ fetch() → PCC API
   │  ├─ sessionStorage 快取匹配
   │  ├─ parseTenderDetail() [複雜資料結構解析]
   │  │  ├─ mergeValue() [重複欄位合併]
   │  │  ├─ buildHierarchyUnified() [遞迴階層構建]
   │  │  └─ processFields() [扁平化為 Section[]]
   │  │
   │  └─ 回傳: { data, targetRecord, isLoading, error, sections }
   │
   ├─ useGoogleAnalytics
   │  ├─ trackPageView(pathname)
   │  └─ trackEvent('tender_detail_tab_change', { tab })
   │
   └─ useSearchParams
      └─ tab state 同步
```

---

## Next 專案 - 簡陋版本

```
TenderDetailPage (Server Component)
│
├─ generateMetadata() [Server-side 執行]
│  ├─ getCachedApiData(PCC_API_CACHE_COLLECTION, apiKey)
│  ├─ fetch(PCC API) [若無快取]
│  └─ setCachedApiData() [24h TTL]
│
└─ <TenderDetail tenderId={params.tenderId} />

TenderDetail (168 行) [Client Component]
│ ('use client')
│
├─ BackButton
│  └─ returnPath="/tender/search"
│
├─ TenderDetailTracker (GA)
│
├─ TenderHeader (77 行) [基本相同]
│  ├─ 標案標題
│  ├─ 公告日期
│  ├─ 公告類型
│  ├─ 招標機關
│  └─ 3 個按鈕 (同 Legacy)
│
├─ TenderTabNavigation (88 行) [簡化]
│  │
│  ├─ useState(availableWidth)
│  ├─ avgTabWidth = 120px (硬編碼)
│  ├─ shouldUseDropdown 邏輯
│  │
│  ├─ 下拉選單模式 [太多標籤時]
│  │  └─ <select> (簡單下拉)
│  │
│  └─ 標籤模式 [標準模式]
│     ├─ 無圖標映射 ❌
│     ├─ 無 Framer Motion 動畫 ❌
│     ├─ border-b-2 簡單邊框
│     └─ hover:border-gray-300 簡單懸停效果
│
├─ 條件渲染區塊
│  │
│  ├─ TenderBasicInfo (78 行) [完全重寫]
│  │  │
│  │  ├─ useState(expandedGroups) [本地狀態]
│  │  │
│  │  ├─ renderFieldValue() [內聯邏輯，無 FieldRenderer]
│  │  │  │
│  │  │  ├─ 若有 children → 簡單折疊/展開
│  │  │  │  └─ ChevronDown / ChevronRight 切換
│  │  │  │
│  │  │  └─ 若無 children → 直接顯示
│  │  │     └─ grid grid-cols-3 gap-4
│  │  │        ├─ 欄位名稱 (col-span-1)
│  │  │        └─ 欄位值 (col-span-2)
│  │  │
│  │  └─ 缺失特性
│  │     ├─ ❌ 電話號碼智能識別
│  │     ├─ ❌ 郵件智能識別
│  │     ├─ ❌ URL 智能識別
│  │     ├─ ❌ 地址智能識別
│  │     ├─ ❌ 物件陣列 2 列網格
│  │     ├─ ❌ FieldRendererProvider Context
│  │     ├─ ❌ 深度感知樣式
│  │     └─ ❌ Framer Motion 動畫
│  │
│  ├─ TenderSpecialInfo (簡化)
│  │  │
│  │  ├─ findCommitteeMembers() [簡化版]
│  │  │  ├─ 查找 "評選委員" 欄位
│  │  │  └─ map: { name, expertise, field, experience }
│  │  │
│  │  ├─ CommitteeCard (50 行) [大幅簡化]
│  │  │  │
│  │  │  ├─ 基本結構
│  │  │  │  ├─ UserRound 圖標 (green/blue)
│  │  │  │  ├─ 名稱 + 專家標籤
│  │  │  │  ├─ 職業 (簡單 text-sm)
│  │  │  │  └─ 經驗 (簡單 text-sm)
│  │  │  │
│  │  │  └─ 缺失特性
│  │  │     ├─ ❌ parseExperience() 文本解析
│  │  │     ├─ ❌ 出席會議狀態 Badge
│  │  │     ├─ ❌ 職業 Badge 陣列
│  │  │     ├─ ❌ 詳細經歷卡片 (gradient-to-br)
│  │  │     ├─ ❌ 經歷展開動畫
│  │  │     ├─ ❌ 評選備註欄位
│  │  │     └─ ❌ 專業領域分類
│  │  │
│  │  ├─ ComplaintUnitCard (基本保留)
│  │  │
│  │  └─ renderGeneralFields() [通用欄位]
│  │     └─ 簡單的邊框+標題顯示
│  │
│  └─ YesNoSection [隱藏]
│
├─ DataSource (簡化版)
│  ├─ 政府電子採購網
│  └─ 標案瀏覽
│
└─ Hooks & Logic
   ├─ useTenderDetail (296 行) [類似 Legacy]
   │  ├─ fetch(/api/tender-detail-proxy) [API 代理]
   │  ├─ parseTenderDetail() [相同邏輯]
   │  └─ 回傳: { data, targetRecord, isLoading, error, sections }
   │
   ├─ useRouter (Next.js)
   │  └─ router.replace() [更新 URL]
   │
   └─ useSearchParams (Next.js)
      └─ tab state 同步
```

---

## 代碼量對比統計

### Legacy 總代碼
```
TenderDetail.tsx          174 行
useTenderDetail Hook      225 行
FieldRenderer             228 行 ⭐️ 核心
TenderSpecialInfo         210 行
CommitteeCard             168 行
TenderTabNavigation        60 行
TenderBasicInfo            45 行
TenderHeader               72 行
ComplaintUnitCard          +30 行
YesNoSection               +20 行
─────────────────────────────────
小計 (Tender Detail)    1,182 行

+ TenderSearch.tsx        +80 行
+ useTenderSearch Hook    +120 行
─────────────────────────────────
總計                    1,382 行
```

### Next 總代碼
```
TenderDetail.tsx          168 行
useTenderDetail Hook      296 行
TenderBasicInfo            78 行
CommitteeCard              50 行
TenderTabNavigation        88 行
TenderHeader               77 行
ComplaintUnitCard          +30 行
YesNoSection               +20 行
TenderDetailTracker        +40 行
TenderSpecialInfo         (部分簡化)
─────────────────────────────────
小計 (Tender Detail)      757 行

+ [tenderId]/page.tsx      92 行
+ API proxy route         ~100 行
+ TenderSearch.tsx         +80 行
─────────────────────────────────
總計                    ~1,029 行
```

### 差異
```
Legacy: 1,182 行 (Tender Detail)
Next:    757 行 (Tender Detail)
─────────────────────────────────
減少: -425 行 (-36%)

但失去的功能:
- FieldRenderer (228 行) ❌
- 智能內容識別邏輯 (-50 行邏輯)
- Framer Motion 動畫 (-30 行)
- 圖標映射 (-15 行)
- CommitteeCard 詳細邏輯 (-118 行)
  
淨結果:
- 代碼更少 (-36%)
- 功能少 40%
- UI/UX 品質降低 40%
- 可複用性降低
```

---

## 關鍵檔案對應表

| 功能 | Legacy 檔案 | Next 檔案 | 狀態 |
|------|-----------|---------|------|
| 主頁面 | TenderDetail.tsx | TenderDetail.tsx | ✓ 相似 |
| 路由 | App.tsx Routes | [tenderId]/page.tsx | ✓ 現代化 |
| 元數據 | SEOHead | generateMetadata() | ✓ 改進 |
| 資料獲取 | useTenderDetail | useTenderDetail | ✓ 相似 |
| 欄位渲染 | FieldRenderer | (移除) | ❌ 缺失 |
| Tab 導航 | TenderTabNavigation | TenderTabNavigation | ~ 簡化 |
| 基本資訊 | TenderBasicInfo | TenderBasicInfo | ~ 簡化 |
| 特殊資訊 | TenderSpecialInfo | TenderSpecialInfo | ~ 簡化 |
| 委員卡片 | CommitteeCard | CommitteeCard | ~ 簡化 |
| 快取 | sessionStorage | MongoDB | ✓ 改進 |
| 動畫庫 | framer-motion | framer-motion | ✓ 但少用 |
| Icon 庫 | lucide-react | lucide-react | ✓ 但少用 |

