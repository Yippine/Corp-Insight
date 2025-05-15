# Next.js 頁面載入與切換速度優化指南

本文檔提供優化 Next.js 專案中頁面載入和切換速度的最佳實踐指南。

## 1. 頁面結構與數據獲取優化

### 頁面組件結構範例

```tsx
// 優化後的頁面結構範例 (app/company/search/page.tsx)
import { Suspense } from 'react';
import { CompanySearchResults } from '@/components/company/CompanySearchResults';
import { SearchSkeleton } from '@/components/company/SearchSkeleton';
import CompanySearchForm from '@/components/company/CompanySearchForm';

// 靜態頁面元數據
export const metadata = {
  title: '企業搜尋 | 企業放大鏡',
  description: '搜尋並查詢台灣企業的詳細資訊，包含公司統一編號、資本額、董事長等重要資料。'
}

// 高效能的伺服器組件
export default async function CompanySearchPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string }
}) {
  // 注意: 這裡不使用客戶端狀態或 useState，因為這是一個伺服器組件
  const query = searchParams.q || '';
  const page = Number(searchParams.page) || 1;
  
  return (
    <div className="space-y-6">
      <CompanySearchForm initialQuery={query} />
      
      {/* 使用 Suspense 包裹數據依賴組件 */}
      <Suspense fallback={<SearchSkeleton />}>
        <CompanySearchResults query={query} page={page} />
      </Suspense>
    </div>
  );
}
```

### 數據獲取優化

在伺服器組件中使用平行數據獲取：

```tsx
// 組件內的平行獲取 (components/company/CompanySearchResults.tsx)
import { fetchCompanyResults, fetchTotalCount } from '@/lib/api';

export async function CompanySearchResults({ query, page }) {
  // 利用 Promise.all 進行平行請求，減少等待時間
  const [results, totalCount] = await Promise.all([
    fetchCompanyResults(query, page),
    fetchTotalCount(query)
  ]);
  
  // 渲染結果
  return (
    <div>
      <p>共找到 {totalCount} 筆結果</p>
      <ResultsList results={results} />
    </div>
  );
}
```

## 2. 路由緩存策略

### 實現增量靜態再生 (ISR)

對於頻繁訪問但不需要即時數據的頁面：

```tsx
// fetch 函數添加重驗證配置
export async function fetchCompanyData(id: string) {
  // 增加緩存選項 - ISR (增量靜態再生)
  const res = await fetch(`https://api.example.com/companies/${id}`, { 
    next: { revalidate: 3600 }  // 每小時重新驗證一次
  });
  
  if (!res.ok) throw new Error('Failed to fetch company data');
  return res.json();
}
```

### 使用完整頁面緩存

對於不常變動的頁面，設置較長的重驗證時間：

```tsx
// 配置較長的重驗證時間 (app/company/[id]/page.tsx)
export async function generateMetadata({ params }: { params: { id: string } }) {
  const company = await fetchCompanyData(params.id);
  
  return {
    title: `${company.name} | 企業放大鏡`,
    description: company.description || `查看 ${company.name} 的詳細公司資訊`,
  };
}

export const revalidate = 86400; // 每24小時重新驗證一次
```

## 3. 路由預取與預載入策略

### 預取路由資料

```tsx
// 在導航組件中預取可能的路由 (components/Navigation.tsx)
'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  
  // 預取常用路由
  useEffect(() => {
    // 預取熱門路由
    router.prefetch('/company/search');
    router.prefetch('/tender/search');
    
    // 如果在企業搜尋頁，預取熱門企業詳情頁
    if (pathname === '/company/search') {
      router.prefetch('/company/detail/12345678');  // 假設這是熱門企業ID
    }
  }, [router, pathname]);
  
  return (
    <nav>
      {/* 導航連結 */}
    </nav>
  );
}
```

### 使用 `<Link>` 組件自動預取優化

```tsx
// 在搜索結果列表中使用優化的 Link 組件 (components/ResultsList.tsx)
import Link from 'next/link';

export function ResultsList({ results }) {
  return (
    <ul>
      {results.map(item => (
        <li key={item.id}>
          {/* Next.js Link 組件會自動預取視窗內可見的連結 */}
          <Link href={`/company/detail/${item.id}`} prefetch={true}>
            {item.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}
```

## 4. 細粒度 Suspense 邊界

### 骨架屏載入

```tsx
// 在頁面不同部分使用細粒度的 Suspense (app/company/detail/[id]/page.tsx)
import { Suspense } from 'react';
import CompanyBasicInfo from '@/components/company/CompanyBasicInfo';
import CompanyFinancials from '@/components/company/CompanyFinancials';
import CompanyTenders from '@/components/company/CompanyTenders';
import { 
  BasicInfoSkeleton,
  FinancialsSkeleton,
  TendersSkeleton
} from '@/components/skeletons';

export default async function CompanyDetailPage({ params }) {
  const { id } = params;
  
  return (
    <div className="space-y-8">
      {/* 基本資訊區塊 - 最優先載入 */}
      <Suspense fallback={<BasicInfoSkeleton />}>
        <CompanyBasicInfo id={id} />
      </Suspense>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* 財務資訊區塊 - 次要載入 */}
        <Suspense fallback={<FinancialsSkeleton />}>
          <CompanyFinancials id={id} />
        </Suspense>
        
        {/* 相關標案資訊 - 可延遲載入 */}
        <Suspense fallback={<TendersSkeleton />}>
          <CompanyTenders id={id} />
        </Suspense>
      </div>
    </div>
  );
}
```

### 使用 `loading.tsx` 的最佳實踐

```tsx
// 精簡高效的 loading.tsx (app/company/search/loading.tsx)
export default function SearchLoading() {
  // 避免過重的載入UI，使用輕量級的載入指示器
  return (
    <div className="min-h-[50vh] w-full flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
```

## 5. 客戶端狀態與互動性優化

### 優化客戶端互動組件

```tsx
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

export default function CompanySearchForm({ initialQuery = '' }) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 使用 startTransition 包裹導航，提高響應性
    startTransition(() => {
      const params = new URLSearchParams();
      if (searchQuery) params.set('q', searchQuery);
      router.push(`/company/search?${params.toString()}`);
    });
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input 
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="輸入公司名稱或統一編號..."
        className="w-full p-2 border rounded"
      />
      <button 
        type="submit" 
        disabled={isPending}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        {isPending ? '搜尋中...' : '搜尋'}
      </button>
    </form>
  );
}
```

## 6. 性能監測與持續優化

### 添加性能監測

```tsx
// 添加 Web Vitals 監測 (app/layout.tsx 的擴展)
import { useReportWebVitals } from 'next/web-vitals';

export function WebVitalsReporter() {
  useReportWebVitals(metric => {
    // 發送指標到分析服務
    console.log(metric);

    // 可以將數據發送到後端API或分析服務
    if (metric.name === 'LCP') {
      // 最大內容繪製時間過長
      if (metric.value > 2500) {
        console.warn('LCP too high', metric.value);
      }
    }
  });
  
  return null;
}
```

## 實施建議

1. **逐步實施**：從高影響力頁面開始，如搜索頁和詳情頁
2. **監測並迭代**：實施更改後，監測性能並持續優化
3. **平衡 SEO 與性能**：確保性能優化不犧牲 SEO 需求
4. **優先考慮用戶體驗**：首先優化核心內容顯示速度

## 最佳實踐檢查清單

- [ ] 移除全局 Suspense，改用細粒度 Suspense
- [ ] 將重要頁面轉換為服務器組件並實現平行數據獲取
- [ ] 實施適當的緩存策略 (ISR/SSG/SSR 混合)
- [ ] 添加路由預取優化
- [ ] 使用輕量級載入指示器或骨架屏
- [ ] 優化大型依賴和第三方庫的載入
- [ ] 實施代碼分割和動態導入
- [ ] 定期監測和分析頁面性能指標