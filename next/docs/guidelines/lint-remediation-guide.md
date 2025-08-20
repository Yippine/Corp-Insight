# Linting 問題修復指南 - 實務操作手冊

## 🚨 **BROWNFIELD 開發約束** 🚨

**⚠️ 此修復指南必須遵循全專案 Brownfield 約束：**  
**[../BROWNFIELD-DEVELOPMENT-CONSTRAINTS.md](../BROWNFIELD-DEVELOPMENT-CONSTRAINTS.md)**

**修復原則：**
- ❌ 絕不修改既有業務邏輯
- ❌ 絕不重構既有程式碼結構  
- ✅ 僅進行安全的程式碼清理
- ✅ 優先處理低風險、高收益的問題

---

## 📊 **當前問題分類與處理策略**

### 🟢 **第一優先：安全清理（立即可執行）**

#### 1. 未使用變數清理（15 個錯誤）
**風險級別：** 🟢 極低  
**預期收益：** Error 數量 -15

##### 具體修復步驟：

**檔案：`src/components/aitool/AiToolDetail.tsx`**
```typescript
// ❌ 修復前：
import { useState } from 'react'; // 未使用
import { SomeOtherHook } from './hooks';

// ✅ 修復後：
import { SomeOtherHook } from './hooks';
```

**檔案：`src/components/aitool/AiToolSearch.tsx`**
```typescript
// ❌ 修復前：
import { InlineLoading } from '../common/loading';
import { SearchAnalysis } from './SearchAnalysis';

// ✅ 修復後：
// 移除未使用的 import
```

**檔案：`src/components/aitool/SearchAnalysis.tsx`**
```typescript
// ❌ 修復前：
import { Star, Search, Filter, Clock, Download, AlertTriangle } from 'lucide-react';

// ✅ 修復後：
import { /* 僅保留實際使用的 icons */ } from 'lucide-react';
```

##### 批次處理腳本：
```bash
# 可建立輔助腳本協助識別
#!/bin/bash
# find-unused-imports.sh

echo "檢查未使用的 imports..."
npx eslint --quiet --format json | jq -r '.[] | select(.messages[].ruleId == "@typescript-eslint/no-unused-vars") | .filePath'
```

#### 2. prefer-const 修復（1 個錯誤）
**風險級別：** 🟢 極低  
**位置：** `src/lib/gemini.server.ts:25`

```typescript
// ❌ 修復前：
let pool = createGeminiPool(); // pool 從未重新賦值

// ✅ 修復後：
const pool = createGeminiPool();
```

**修復驗證：**
```bash
# 確認修改不影響功能
npm run build
npm run lint | grep "prefer-const"
```

### 🟡 **第二優先：效能最佳化（需要測試）**

#### 3. 圖片最佳化（4 個警告）
**風險級別：** 🟡 中等  
**預期收益：** 效能提升 + SEO 改善

##### 修復清單：

**檔案：`src/components/Header.tsx:45`**
```typescript
// ❌ 修復前：
<img src="/magnifier.ico" alt="Corp Insight Logo" className="h-8 w-8" />

// ✅ 修復後：
import Image from 'next/image';
<Image 
  src="/magnifier.ico" 
  alt="Corp Insight Logo" 
  width={32} 
  height={32}
  className="h-8 w-8"
  priority // Logo 通常需要優先載入
/>
```

**檔案：`src/app/feedback/FeedbackForm.tsx:368`**
```typescript
// ❌ 修復前：
<img src="/some-image.png" alt="Feedback" />

// ✅ 修復後：
import Image from 'next/image';
<Image 
  src="/some-image.png" 
  alt="Feedback"
  width={適當寬度}
  height={適當高度}
/>
```

**檔案：`src/components/aitool/LineBotBanner.tsx:52`**
```typescript
// ❌ 修復前：
<img src={bannerImage} alt="LineBot Banner" />

// ✅ 修復後：
import Image from 'next/image';
<Image 
  src={bannerImage} 
  alt="LineBot Banner"
  width={bannerWidth}
  height={bannerHeight}
  placeholder="blur" // 如果有 blurDataURL
/>
```

**檔案：`src/app/auth/test/page.tsx:110`**
```typescript
// ❌ 修復前：
<img src="/test-image.png" alt="Auth Test" />

// ✅ 修復後：
import Image from 'next/image';
<Image 
  src="/test-image.png" 
  alt="Auth Test"
  width={測試頁面合適尺寸}
  height={測試頁面合適尺寸}
/>
```

##### 修復後測試檢查清單：
- [ ] 頁面載入正常，圖片顯示正確
- [ ] 響應式設計在各裝置上正常
- [ ] 圖片載入效能改善（可使用 Lighthouse 測試）
- [ ] 沒有 layout shift 問題

### 🟠 **第三優先：React Hook 最佳化（需要仔細評估）**

#### 4. useEffect 依賴陣列問題（8 個警告）
**風險級別：** 🟠 中-高等  
**處理策略：** 逐一分析，確保不改變組件行為

##### 具體分析與修復：

**檔案：`src/hooks/useTenderSearch.ts:64`**
```typescript
// ❌ 現況：
useEffect(() => {
  // 使用 searchParams 但未在依賴陣列中
}, []); // 缺少 searchParams 依賴

// 🔍 分析步驟：
// 1. 確認 searchParams 變化是否需要觸發 effect
// 2. 評估加入依賴是否會導致無限重渲染
// 3. 考慮使用 useCallback 或 useMemo 優化

// ✅ 可能的修復方案：
useEffect(() => {
  // 效果邏輯
}, [searchParams]); // 加入依賴

// 或者如果 searchParams 變化不應觸發：
const stableSearchParams = useRef(searchParams);
useEffect(() => {
  // 使用 stableSearchParams.current
}, []); // 保持空依賴陣列
```

**檔案：`src/components/common/prompt/PromptOptimizer.tsx`**（多個 Hook 依賴問題）
```typescript
// ❌ 現況：缺少多個依賴
useEffect(() => {
  // 使用 history, isAwaitingFirstToken, isComparisonMode, isOptimizing, prompt
}, []); // 缺少依賴

// 🔍 風險評估：
// - 這些狀態變化是否應該觸發 effect？
// - 加入依賴是否會影響組件效能？
// - 是否存在競態條件？

// ✅ 建議處理方式：
// 1. 分析每個缺少的依賴是否真的需要
// 2. 使用 useCallback 包裝函數依賴
// 3. 考慮拆分複雜的 effect
```

##### Hook 依賴修復流程：
1. **理解原始意圖**：分析 effect 的預期行為
2. **依賴分析**：確定哪些值的變化應該觸發重新執行
3. **效能評估**：評估加入依賴對效能的影響
4. **漸進修復**：一次修復一個 effect，充分測試
5. **回滾準備**：準備回滾方案以防出現問題

### 🔴 **第四優先：保持現狀（不建議修改）**

#### 5. TypeScript any 類型問題（~80 個警告）
**風險級別：** 🔴 高  
**處理策略：** 記錄但不修改

**原因分析：**
- API 路由中的 `any` 通常涉及第三方資料格式
- 既有的資料處理邏輯可能依賴動態類型
- 修改可能導致型別錯誤和執行時問題

**文檔記錄範例：**
```typescript
// 📝 技術債務記錄
// 檔案：src/app/api/tender-detail-proxy/route.ts:27
// 問題：function parameter 使用 any 類型
// 原因：第三方 API 回應格式不固定
// 影響：低（功能正常）
// 計畫：配合 API 版本升級時一併處理
```

#### 6. CommonJS require 問題（2 個警告）
**風險級別：** 🔴 高  
**位置：** 腳本檔案  
**處理策略：** 保持現狀

**原因：**
- 腳本檔案通常在 Node.js 環境中執行
- 可能依賴只支援 CommonJS 的舊套件
- 修改可能導致腳本無法執行

---

## 🛠️ **實際修復操作步驟**

### Phase 1：安全清理操作（預計 2 小時）

#### 步驟 1：準備工作
```bash
# 1. 建立修復分支
git checkout -b lint-fix/safe-cleanup

# 2. 備份當前狀態
git add . && git commit -m "backup: before lint cleanup"

# 3. 確保測試環境正常
npm run build
npm run dev # 確認開發環境啟動正常
```

#### 步驟 2：執行清理
```bash
# 1. 清理未使用的 imports（建議手動逐一檢查）
# 使用 IDE 的 "Remove Unused Imports" 功能
# 或者使用 ESLint 自動修復（僅針對 unused-vars）
npx eslint --fix --fix-type suggestion src/**/*.{ts,tsx}

# 2. 修復 prefer-const
# 手動修改 src/lib/gemini.server.ts:25

# 3. 驗證修復結果
npm run lint | grep -E "Error|@typescript-eslint/no-unused-vars|prefer-const"
```

#### 步驟 3：驗證與測試
```bash
# 1. 建置測試
npm run build

# 2. 功能測試
npm run dev
# 手動測試主要功能：
# - 首頁載入
# - AI 工具搜索
# - 公司搜索
# - 招標搜索

# 3. Lint 結果檢查
npm run lint 2>&1 | grep "Error" | wc -l
# 預期：Error 數量從 13 減少到 ~0-5
```

### Phase 2：圖片最佳化操作（預計 4 小時）

#### 步驟 1：圖片尺寸調查
```bash
# 1. 檢查現有圖片檔案
find public/ -name "*.png" -o -name "*.jpg" -o -name "*.ico" | xargs ls -la

# 2. 在瀏覽器開發工具中檢查現有圖片的顯示尺寸
# 記錄每個圖片的實際顯示尺寸用於設定 width/height
```

#### 步驟 2：逐一替換
```typescript
// 模板：
import Image from 'next/image';

// 替換模式：
<img src="path" alt="description" className="..." />
// ↓
<Image 
  src="path" 
  alt="description"
  width={實際寬度}
  height={實際高度}
  className="..."
  priority={是否為首屏圖片}
  placeholder="blur" // 如果有 blurDataURL
/>
```

#### 步驟 3：效能測試
```bash
# 使用 Lighthouse 或相似工具測試
# 關注指標：
# - LCP (Largest Contentful Paint)
# - CLS (Cumulative Layout Shift)
# - 整體效能分數
```

---

## 📋 **修復檢查清單**

### 每個修復階段必須檢查：
- [ ] **功能正常**：所有既有功能運作正常
- [ ] **建置成功**：`npm run build` 無錯誤
- [ ] **Lint 改善**：相關 lint 問題已解決
- [ ] **無副作用**：沒有引入新的錯誤或警告
- [ ] **效能穩定**：頁面載入速度沒有變慢
- [ ] **版本控制**：每個修復階段都有對應的 commit

### 緊急回滾程序：
```bash
# 如果發現任何問題，立即執行：
git reset --hard HEAD~1  # 回滾上一個 commit
git push --force-with-lease  # 如果已推送到遠端

# 或者回滾到備份點：
git reset --hard backup-commit-hash
```

---

## 📊 **預期成果與追蹤**

### 量化目標：
- **Error 數量**：從 13 個 → 目標 5 個以下（-60%）
- **Warning 數量**：從 120 個 → 目標 100 個以下（-17%）
- **Lighthouse 效能分數**：改善 5-10 分（圖片最佳化後）

### 追蹤機制：
```bash
# 建立追蹤腳本
#!/bin/bash
# lint-progress-tracker.sh

echo "=== Lint Progress Report $(date) ===" >> lint-progress.log
echo "Errors: $(npm run lint 2>&1 | grep 'Error' | wc -l)" >> lint-progress.log
echo "Warnings: $(npm run lint 2>&1 | grep 'Warning' | wc -l)" >> lint-progress.log
echo "---" >> lint-progress.log
```

### 成功標準：
✅ **最小成功**：Error 數量減少 50% 以上，沒有功能問題  
✅ **期望成功**：Error 數量減少 80% 以上，效能有所提升  
✅ **超越期望**：Warning 也有顯著減少，整體程式碼品質提升

---

## 🚨 **風險管理與應變計畫**

### 常見風險與應對：

#### 風險 1：圖片最佳化導致版面破版
**症狀：** Layout shift、圖片尺寸不正確  
**應對：**
```typescript
// 1. 檢查 CSS 樣式是否衝突
// 2. 調整 Image 屬性
<Image 
  src="..." 
  alt="..."
  width={width}
  height={height}
  style={{ width: 'auto', height: 'auto' }} // 讓 CSS 控制尺寸
  sizes="(max-width: 768px) 100vw, 50vw" // 響應式尺寸
/>
```

#### 風險 2：Hook 依賴修改導致無限重渲染
**症狀：** 瀏覽器卡頓、記憶體使用激增  
**應對：**
```typescript
// 1. 使用 useCallback 穩定函數引用
const stableCallback = useCallback(() => {
  // 邏輯
}, [必要依賴]);

// 2. 使用 useMemo 穩定物件引用
const stableObject = useMemo(() => ({
  // 物件屬性
}), [必要依賴]);

// 3. 分離 effect 邏輯
useEffect(() => {
  // 僅處理 A 相關邏輯
}, [depA]);

useEffect(() => {
  // 僅處理 B 相關邏輯  
}, [depB]);
```

#### 風險 3：未使用變數清理導致功能異常
**症狀：** 某些功能突然失效  
**原因：** 誤刪了實際有用但 ESLint 誤判的變數  
**應對：**
```typescript
// 使用註釋保留變數
const importantButUnusedVar = getValue(); // eslint-disable-line @typescript-eslint/no-unused-vars

// 或者使用 _ 前綴表示故意未使用
const _intentionallyUnused = getValue();
```

---

## 📝 **修復記錄範本**

### Commit Message 格式：
```bash
# 安全清理類型
git commit -m "lint: remove unused imports and fix prefer-const issues

- Remove unused imports from AiToolDetail, AiToolSearch, SearchAnalysis
- Change let to const in gemini.server.ts where variable is never reassigned
- No functional changes, pure code cleanup

Brownfield compliance: ✅ No existing functionality modified"

# 圖片最佳化類型  
git commit -m "perf: optimize images using Next.js Image component

- Replace <img> with <Image> in Header, FeedbackForm, LineBotBanner, auth test page
- Add proper width/height attributes for better LCP
- Add priority loading for above-the-fold images

Expected impact: Improved Lighthouse performance score, better SEO
Brownfield compliance: ✅ No logic changes, UI improvements only"
```

### 修復報告範本：
```markdown
## Lint 修復報告 - Phase 1 安全清理

### 執行時間
- 開始：2025-08-20 10:00
- 完成：2025-08-20 12:30  
- 總耗時：2.5 小時

### 修復範圍
- ✅ 移除 15 個未使用的 import 語句
- ✅ 修復 1 個 prefer-const 問題
- ✅ 通過所有功能測試

### 量化結果
- Error 數量：13 → 5 (-62%)
- Warning 數量：120 → 120 (無變化)
- 建置時間：無明顯變化
- 功能影響：無

### 遇到的問題與解決方案
1. **問題**：某個 import 看似未使用但實際用於型別檢查
   **解決**：保留該 import 並添加註釋說明

2. **問題**：prefer-const 修改後需要檢查相關函數
   **解決**：確認 pool 變數確實從未重新賦值，修改安全

### 下一步計畫
- Phase 2：圖片最佳化（預計下週執行）
- 持續監控：確認此次修改無長期副作用
```

---

**最後更新：2025-08-20**  
**版本：v1.0**  
**維護者：智能治理專家系統**  
**適用範圍：Corp-Insight Next.js 14 專案**