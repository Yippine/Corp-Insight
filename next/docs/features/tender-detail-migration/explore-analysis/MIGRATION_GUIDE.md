# 從 Legacy 遷移 FieldRenderer 到 Next 專案 - 實施指南

## 概述

將 Legacy 的 228 行 FieldRenderer 組件遷移到 Next 專案，以恢復以下功能：
- 智能內容識別 (電話、郵件、URL、地址)
- 遞迴展開式結構
- Framer Motion 動畫
- 深度感知樣式

---

## 第 1 步：建立 FieldRenderer 組件

### 檔案位置
```
next/src/components/tender/detail-components/FieldRenderer.tsx
```

### 源代碼
從 Legacy 複製並適配：
```typescript
// next/src/components/tender/detail-components/FieldRenderer.tsx

'use client';

import { motion } from 'framer-motion';
import { Phone, Mail, Globe, MapPin, ChevronDown } from 'lucide-react';
import { useState, createContext, useContext } from 'react';
import type { FieldValue } from '@/hooks/useTenderDetail';

// 創建上下文用於跨組件管理展開狀態
const ExpandContext = createContext<{
  expandedFields: Record<string, boolean>;
  toggleFieldExpansion: (fieldKey: string) => void;
}>({
  expandedFields: {},
  toggleFieldExpansion: () => {},
});

// 導出提供者組件
export function FieldRendererProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [expandedFields, setExpandedFields] = useState<Record<string, boolean>>(
    {}
  );

  const toggleFieldExpansion = (fieldKey: string) => {
    setExpandedFields((prev) => ({
      ...prev,
      [fieldKey]: !prev[fieldKey],
    }));
  };

  return (
    <ExpandContext.Provider value={{ expandedFields, toggleFieldExpansion }}>
      {children}
    </ExpandContext.Provider>
  );
}

interface FieldRendererProps {
  field: FieldValue;
  depth?: number;
  sectionTitle: string;
  parentKey?: string;
}

export default function FieldRenderer({
  field,
  depth = 0,
  sectionTitle,
  parentKey = '',
}: FieldRendererProps) {
  const { expandedFields, toggleFieldExpansion } = useContext(ExpandContext);

  // 渲染欄位值的通用函數
  const renderFieldValue = (value: string | string[]) => {
    if (Array.isArray(value)) {
      return value.map((item, index) => (
        <p key={index} className="text-base text-gray-900">
          {item}
        </p>
      ));
    }

    // 處理特殊格式
    if (value.includes('\n')) {
      return value.split('\n').map((line, index) => (
        <p key={index} className="text-base text-gray-900">
          {line}
        </p>
      ));
    }

    // 處理電話號碼
    if (value.match(/^\(\d{2,4}\)[0-9\-#]+$/)) {
      return (
        <div className="flex items-center">
          <Phone className="h-5 w-5 text-gray-400 mr-2" />
          <span className="text-base text-gray-900">{value}</span>
        </div>
      );
    }

    // 處理電子郵件
    if (value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return (
        <div className="flex items-center">
          <Mail className="h-5 w-5 text-gray-400 mr-2" />
          <a
            href={`mailto:${value}`}
            className="text-base text-blue-600 hover:text-blue-800"
          >
            {value}
          </a>
        </div>
      );
    }

    // 處理網址
    if (value.startsWith('http')) {
      return (
        <div className="flex items-center">
          <Globe className="h-5 w-5 text-gray-400 mr-2" />
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-base text-blue-600 hover:text-blue-800"
          >
            {value}
          </a>
        </div>
      );
    }

    // 處理地址
    if (value.match(/[縣市區鄉鎮路街]/)) {
      return (
        <div className="flex items-center">
          <MapPin className="h-5 w-5 text-gray-400 mr-2" />
          <span className="text-base text-gray-900">{value}</span>
        </div>
      );
    }

    return <span className="text-base text-gray-900">{value}</span>;
  };

  const hasChildren = field.children && field.children.length > 0;
  const paddingClass = depth > 0 ? 'pl-4' : '';
  const borderClass = depth > 0 ? 'border-l-2 border-gray-200' : '';
  const fieldKey = `${parentKey}-${field.label}`;
  const isExpanded = expandedFields[fieldKey] ?? true;

  const gridClass =
    (sectionTitle === '投標廠商' && depth === 0) ||
    (sectionTitle === '決標品項' && depth === 1)
      ? 'grid grid-cols-2 gap-4'
      : '';

  const isArrayOfObjects =
    Array.isArray(field.value) &&
    field.value.some((item: any) => typeof item === 'object');

  return (
    <div key={field.label} className={`${paddingClass} ${borderClass} mb-4`}>
      <div
        className="flex justify-between items-start group cursor-pointer"
        onClick={() => hasChildren && toggleFieldExpansion(fieldKey)}
        role="button"
        aria-expanded={isExpanded}
      >
        <dt
          className={`text-base ${
            depth === 0
              ? 'font-medium text-gray-700'
              : depth === 1
                ? 'font-normal text-gray-600'
                : 'font-light text-gray-500'
          }`}
        >
          <span className="inline-block w-3 h-3 bg-blue-100 rounded-full mr-2"></span>
          {field.label}
        </dt>
        {(hasChildren || isArrayOfObjects) && (
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-5 w-5 text-gray-400" />
          </motion.div>
        )}
      </div>

      {isExpanded && (
        <>
          {field.value && !isArrayOfObjects && (
            <dd className="mt-1 ml-5">{renderFieldValue(field.value)}</dd>
          )}

          {isArrayOfObjects ? (
            <div className={`mt-2 ${gridClass}`}>
              {(field.value as any[]).map((item, index) => (
                <div
                  key={index}
                  className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                >
                  {Object.entries(item).map(([key, value]) => (
                    <div key={key} className="mb-3 last:mb-0">
                      <div className="text-sm font-medium text-gray-600">
                        {key}
                      </div>
                      <div className="text-base text-gray-900">
                        {Array.isArray(value)
                          ? value.join(', ')
                          : typeof value === 'object'
                            ? JSON.stringify(value, null, 2)
                            : String(value || '')}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            hasChildren && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`space-y-3 mt-2 ${gridClass}`}
              >
                {field.children?.map((child, childIndex) => (
                  <FieldRenderer
                    key={childIndex}
                    field={child}
                    depth={depth + 1}
                    sectionTitle={sectionTitle}
                    parentKey={fieldKey}
                  />
                ))}
              </motion.div>
            )
          )}
        </>
      )}
    </div>
  );
}
```

---

## 第 2 步：更新 TenderBasicInfo 組件

### 檔案位置
```
next/src/components/tender/detail/TenderBasicInfo.tsx
```

### 新代碼
```typescript
'use client';

import { motion } from 'framer-motion';
import { Section } from '../../../hooks/useTenderDetail';
import FieldRenderer, {
  FieldRendererProvider,
} from '../detail-components/FieldRenderer';

interface TenderBasicInfoProps {
  section: Section;
}

export default function TenderBasicInfo({ section }: TenderBasicInfoProps) {
  return (
    <motion.div className="rounded-lg bg-white shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-50 to-gray-50 px-6 py-4">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center">
          <span className="w-2 h-6 bg-blue-500 rounded-full mr-3"></span>
          {section.title}
        </h3>
      </div>

      <div className="px-6 py-5 space-y-6">
        <FieldRendererProvider>
          <dl
            className={`grid ${["投標廠商", "決標品項"].includes(section.title) ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"} gap-6`}
          >
            {section.fields.map((field, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
              >
                <FieldRenderer
                  field={field}
                  depth={0}
                  sectionTitle={section.title}
                />
              </div>
            ))}
          </dl>
        </FieldRendererProvider>
      </div>
    </motion.div>
  );
}
```

---

## 第 3 步：恢復 TenderTabNavigation 圖標

### 檔案位置
```
next/src/components/tender/detail/TenderTabNavigation.tsx
```

### 新增圖標映射
```typescript
'use client';

import { Building2, FileText, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Section } from '../../../hooks/useTenderDetail';

// 定義頁籤圖標映射 (添加)
export const tabIcons = {
  機關資料: Building2,
  已公告資料: FileText,
  投標廠商: Users,
  決標品項: FileText,
  決標資料: FileText,
  採購資料: FileText,
  招標資料: FileText,
  領投開標: FileText,
  其他: FileText,
  無法決標公告: FileText,
  標案內容: FileText,
  最有利標: Users,
} as const;

interface TenderTabNavigationProps {
  sections: Section[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function TenderTabNavigation({
  sections,
  activeTab,
  onTabChange,
}: TenderTabNavigationProps) {
  const [availableWidth, setAvailableWidth] = useState(0);

  useEffect(() => {
    const updateWidth = () => {
      setAvailableWidth(window.innerWidth);
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => {
      window.removeEventListener('resize', updateWidth);
    };
  }, []);

  const avgTabWidth = 140; // 更新為更大的寬度 (包含圖標)
  const maxTabs = Math.floor((availableWidth * 0.9) / avgTabWidth);
  const shouldUseDropdown = sections.length > maxTabs;

  if (shouldUseDropdown) {
    return (
      <div className="relative z-10 rounded-lg bg-white p-3 shadow">
        <select
          value={activeTab}
          onChange={e => onTabChange(e.target.value)}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        >
          {sections.map(section => (
            <option key={section.title} value={section.title}>
              {section.title}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
      <div className="scrollbar-hide overflow-x-auto">
        <nav className="border-b border-gray-200">
          <div className="flex">
            {sections.map(section => {
              const Icon =
                tabIcons[section.title as keyof typeof tabIcons] || FileText;
              const isActive = activeTab === section.title;
              
              return (
                <button
                  key={section.title}
                  onClick={() => onTabChange(section.title)}
                  className={`
                    whitespace-nowrap border-b-2 px-6 py-4 text-sm font-medium flex items-center gap-2
                    ${
                      isActive
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  {section.title}
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
```

---

## 第 4 步：恢復 CommitteeCard 詳細版本

### 檔案位置
```
next/src/components/tender/detail-components/CommitteeCard.tsx
```

### 複製 Legacy 版本 (168 行)
參考: `/mnt/c/Users/user/Documents/Yippine/Program/Corp-Insight/legacy/src/components/tender/detail-components/CommitteeCard.tsx`

關鍵變更：
1. 添加 `'use client'` 指令
2. 導入路徑更改為 Next 風格 (`@/...`)
3. 其他邏輯保持不變

---

## 第 5 步：更新 TenderSpecialInfo 組件

### 檔案位置
```
next/src/components/tender/detail/TenderSpecialInfo.tsx
```

### 引入 CommitteeCard
```typescript
'use client';

import { Section, FieldValue } from '../../../hooks/useTenderDetail';
import CommitteeCard from '../detail-components/CommitteeCard';
import ComplaintUnitCard from '../detail-components/ComplaintUnitCard';
import TenderBasicInfo from './TenderBasicInfo';

interface TenderSpecialInfoProps {
  section: Section;
}

export default function TenderSpecialInfo({ section }: TenderSpecialInfoProps) {
  // ... existing logic ...
  
  // 使用已恢復的 CommitteeCard
  if (section.title === '最有利標') {
    return (
      <div className="space-y-6">
        <TenderBasicInfo section={section} />
        {/* CommitteeCard 列表 */}
      </div>
    );
  }
  
  // ... rest of implementation ...
}
```

---

## 檢查清單

### 立即執行
- [ ] 複製 FieldRenderer.tsx 到 next 專案
- [ ] 更新 TenderBasicInfo.tsx (使用 FieldRendererProvider)
- [ ] 更新 TenderTabNavigation.tsx (添加圖標映射)
- [ ] 恢復 CommitteeCard.tsx (完整版本)
- [ ] 確保 TenderSpecialInfo.tsx 正確引入組件

### 測試
- [ ] 訪問 /tender/detail/[tenderId] 頁面
- [ ] 驗證電話號碼正確顯示 (Phone 圖標)
- [ ] 驗證郵件可點擊 (Mail 圖標 + href)
- [ ] 驗證 URL 可外部打開 (Globe 圖標)
- [ ] 驗證地址顯示正確 (MapPin 圖標)
- [ ] 驗證標籤頁有圖標
- [ ] 驗證委員卡片展開詳細經歷
- [ ] 驗證 Framer Motion 動畫正常運作

### 部署前
- [ ] 檢查控制台無錯誤
- [ ] 性能測試 (與 Legacy 對比)
- [ ] 響應式測試 (mobile/tablet/desktop)
- [ ] 無障礙測試 (鍵盤導航)

---

## 預期結果

遷移後，Next 專案應該擁有：
- ✓ 228 行的完整 FieldRenderer 邏輯
- ✓ 智能內容識別 (電話、郵件、URL、地址)
- ✓ 遞迴展開式結構
- ✓ Framer Motion 動畫
- ✓ 深度感知樣式
- ✓ 12 個頁籤圖標
- ✓ 詳細的委員卡片
- ✓ 與 Legacy 幾乎相同的 UI/UX

同時保留 Next 的優勢：
- ✓ Server-side 元資料生成
- ✓ MongoDB 伺服器快取
- ✓ App Router 現代化架構

---

## 性能對比

遷移後預期結果：

| 指標 | Legacy | Next (遷移前) | Next (遷移後) |
|------|--------|-------------|------------|
| UI/UX 完整性 | 9/10 | 5/10 | 9/10 |
| 功能豐富度 | 9/10 | 6/10 | 9/10 |
| 代碼行數 | 1,182 | 757 | 985 |
| 首屏時間 | 中等 | 快 | 快 |
| SEO 友善度 | 7/10 | 9/10 | 9/10 |
| 可複用性 | 高 | 低 | 高 |

---

## 故障排除

### 問題 1: FieldRenderer 報告 "expandedFields is undefined"
**解決方案**: 確保在 TenderBasicInfo 中使用 `<FieldRendererProvider>`

### 問題 2: 圖標未顯示
**解決方案**: 確保 `lucide-react` 已安裝且版本正確

### 問題 3: Framer Motion 動畫無效
**解決方案**: 檢查 `motion` 導入是否正確

### 問題 4: 郵件連結無法點擊
**解決方案**: 確保 Email 正則匹配正確

---

## 估計工時

- 第 1 步: 15 分鐘 (複製 FieldRenderer)
- 第 2 步: 10 分鐘 (更新 TenderBasicInfo)
- 第 3 步: 10 分鐘 (恢復圖標)
- 第 4 步: 10 分鐘 (恢復 CommitteeCard)
- 第 5 步: 10 分鐘 (整合)
- 測試: 30 分鐘

**總計**: 約 1.5 小時

