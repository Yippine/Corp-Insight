# Linting 治理規範 - Brownfield 企業級專案適配版

## 🚨 **BROWNFIELD 開發約束** 🚨

**⚠️ 此治理規範必須遵循全專案 Brownfield 約束：**  
**[../BROWNFIELD-DEVELOPMENT-CONSTRAINTS.md](../BROWNFIELD-DEVELOPMENT-CONSTRAINTS.md)**

**核心約束摘要：**
- ❌ 絕不修改既有程式碼的 linting 配置或既有檔案
- ❌ 絕不因 linting 問題而重構既有功能
- ✅ 僅允許新增新功能相關的 linting 改善
- ✅ 必須維持系統穩定性優先於程式碼品質

---

## 📊 **當前 Linting 狀況分析**

### 已完成改善成果
- ✅ **Error 數量**：從 50+ 減少至 13 個（-73%）
- ✅ **Warning 數量**：從 159 減少至約 120 個（-25%）
- ✅ **系統穩定性**：既有功能完全不受影響

### 剩餘問題分析

#### 高頻問題類型統計
1. **@typescript-eslint/no-explicit-any** - ~80 個警告
   - 佔總問題 67%，主要集中在 API 路由和資料處理邏輯
   - 風險評估：低風險，不影響功能正常運作

2. **@next/next/no-img-element** - 4 個警告
   - 佔總問題 3%，影響 SEO 和效能優化
   - 風險評估：中風險，建議優先處理

3. **@typescript-eslint/no-unused-vars** - 15 個錯誤
   - 佔總問題 13%，主要為未使用的 imports 和變數
   - 風險評估：低風險，但影響程式碼清潔度

4. **@typescript-eslint/no-require-imports** - 2 個警告
   - 佔總問題 2%，CommonJS 與 ESM 混用問題
   - 風險評估：低風險，不建議修改既有邏輯

5. **react-hooks/exhaustive-deps** - 8 個警告
   - 佔總問題 7%，React Hook 依賴陣列問題
   - 風險評估：中-高風險，可能影響組件行為

---

## 🎯 **Brownfield 適配的 Linting 治理策略**

### 核心原則：「安全第一，漸進改善」

#### 1. 三級分類處理策略

##### 🔴 **第一級：禁止修改（高風險）**
```typescript
// 絕不修改這類問題，即使有 linting 警告
const legacyApiHandler = (req: any, res: any) => { // ❌ 保持現狀
  // 既有邏輯...
}

// ❌ 禁止修改原因：
// - 可能破壞既有 API 契約
// - 影響第三方系統整合
// - 產生未預期的副作用
```

**適用問題類型：**
- API 路由中的 `any` 類型
- 第三方套件整合相關的型別問題
- 資料庫連線與查詢邏輯中的 `any`
- 既有的 `require()` 導入（如工具腳本）

##### 🟡 **第二級：謹慎改善（中風險）**
```typescript
// ✅ 可修改，但需充分測試
// 修改前：
<img src="/logo.png" alt="Logo" /> // ⚠️ @next/next/no-img-element

// 修改後：
import Image from 'next/image';
<Image src="/logo.png" alt="Logo" width={100} height={50} />

// ✅ 允許修改原因：
// - 不改變功能邏輯
// - 提升效能和 SEO
// - 風險可控且易於回滾
```

**適用問題類型：**
- `@next/next/no-img-element` 警告
- React Hook 依賴陣列問題（組件行為不變）
- 明顯的未使用變數（不影響邏輯）

##### 🟢 **第三級：安全改善（低風險）**
```typescript
// ✅ 安全修改，不影響功能
// 修改前：
import { Star, Search } from 'lucide-react'; // ❌ unused vars
const Component = () => <div>Content</div>;

// 修改後：
const Component = () => <div>Content</div>;

// ✅ 安全修改原因：
// - 純粹的程式碼清理
// - 不涉及業務邏輯變更
// - 零功能影響風險
```

**適用問題類型：**
- 未使用的 import
- 未使用的變數宣告（非業務邏輯）
- `prefer-const` 問題
- 簡單的註解和格式問題

#### 2. 檔案風險分級制度

##### 🔴 **高風險檔案（禁止修改）**
```bash
# API 核心路由
src/app/api/*/route.ts
src/lib/database/connection.ts
src/lib/gemini.server.ts

# 關鍵業務邏輯
src/lib/aitool/data.ts
src/lib/company/api.ts
src/lib/tender/api.ts
```

##### 🟡 **中風險檔案（謹慎處理）**
```bash
# React 組件（需要測試）
src/components/*/
src/app/*/page.tsx

# Hook 和工具函數
src/hooks/
src/lib/utils/
```

##### 🟢 **低風險檔案（可安全處理）**
```bash
# 型別定義
src/types/
src/lib/*/types.ts

# 配置檔案
src/config/
```

---

## 📋 **ESLint 規則治理建議**

### 當前建議設定

#### 維持現狀規則（不變更）
```json
{
  "rules": {
    "@typescript-eslint/no-explicit-any": "warn", // ✅ 維持警告級別
    "@typescript-eslint/no-require-imports": "warn", // ✅ 維持警告級別
    "@next/next/no-img-element": "warn", // ✅ 維持警告級別
    "react-hooks/exhaustive-deps": "warn" // ✅ 維持警告級別
  }
}
```

#### Brownfield 友善的補充規則
```json
{
  "rules": {
    // 新增：針對新功能的嚴格規則
    "@typescript-eslint/no-explicit-any": ["warn", {
      "ignoreRestArgs": true,
      "fixToUnknown": false
    }],
    
    // 新增：允許既有代碼的彈性處理
    "@typescript-eslint/no-unused-vars": ["error", {
      "varsIgnorePattern": "^_",
      "argsIgnorePattern": "^_",
      "ignoreRestSiblings": true
    }],
    
    // 新增：針對遺留系統的例外處理
    "import/no-require": "off", // 允許 require() 用於腳本
    "prefer-const": ["warn"], // 降級為警告而非錯誤
  },
  
  // 新增：檔案路徑特定規則
  "overrides": [
    {
      "files": ["scripts/**/*.js", "scripts/**/*.ts"],
      "rules": {
        "@typescript-eslint/no-require-imports": "off",
        "@typescript-eslint/no-explicit-any": "off"
      }
    },
    {
      "files": ["src/app/api/**/*.ts"],
      "rules": {
        "@typescript-eslint/no-explicit-any": "off" // API 路由允許 any
      }
    }
  ]
}
```

---

## 🚀 **實務修復建議：分階段執行計畫**

### Phase 1：安全清理（立即執行）✅
**目標：處理 0 風險問題**
- 移除未使用的 import（~15 個錯誤）
- 修正 `prefer-const` 問題（1 個錯誤）
- 清理明顯未使用的變數宣告

**預期效果：**
- Error 從 13 個 → 約 5-8 個
- 不影響任何功能
- 提升程式碼清潔度

### Phase 2：效能優化（2週內執行）⚠️
**目標：處理效能相關警告**
- 替換 4 個 `<img>` 元素為 Next.js `<Image>`
- 需要設定適當的 width/height 屬性
- 需要完整的前端測試

**預期效果：**
- Warning 減少 4 個
- 提升頁面載入效能
- 改善 SEO 指標

### Phase 3：Hook 依賴最佳化（需求驅動）⚠️
**目標：修正 React Hook 依賴問題**
- 僅處理明確不影響組件行為的情況
- 每個修改都需要對應功能測試
- 建議配合新功能開發一併處理

**預期效果：**
- Warning 減少約 8 個
- 組件重渲染最佳化
- 降低潛在 bug 風險

### Phase 4：類型安全提升（長期目標）⚡
**目標：漸進改善 TypeScript 類型**
- **不修改既有程式碼**
- 僅針對新功能使用嚴格類型
- 建立類型定義指引

**實施策略：**
```typescript
// ❌ 不要修改既有的 any 類型
const legacyFunction = (data: any) => { ... }

// ✅ 新功能使用嚴格類型
interface NewFeatureData {
  id: string;
  name: string;
  // ...
}
const newFeatureFunction = (data: NewFeatureData) => { ... }
```

---

## 🛡️ **未來防範機制**

### 1. 新功能開發規範

#### Git Hook 檢查機制
```bash
# 建議新增 pre-commit hook
#!/bin/bash
# 僅檢查新增和修改的檔案
npm run lint:staged
```

#### 新功能程式碼品質門檻
```typescript
// 新功能必須遵循的嚴格規則
// eslint-disable 僅允許特殊情況並需要註釋說明

// ✅ 允許的例外情況
/* eslint-disable @typescript-eslint/no-explicit-any */
// 原因：整合第三方 API，型別定義不完整
const thirdPartyApiCall = (data: any) => { ... }
/* eslint-enable @typescript-eslint/no-explicit-any */

// ❌ 不允許的隨意例外
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const lazyTyping = (data: any) => { ... } // 沒有合理原因
```

### 2. 開發流程整合

#### Code Review 檢查清單
- [ ] 新程式碼是否遵循嚴格的 linting 規則？
- [ ] 是否有不必要的 `eslint-disable` 註釋？
- [ ] 是否修改了既有程式碼的 linting 警告？（❌ 禁止）
- [ ] 新增的程式碼是否影響既有功能？

#### 自動化檢查工具
```json
// package.json 建議新增的腳本
{
  "scripts": {
    "lint:new": "eslint $(git diff --name-only --diff-filter=A | grep -E '\\.(ts|tsx)$')",
    "lint:modified": "eslint $(git diff --name-only --diff-filter=M | grep -E '\\.(ts|tsx)$')",
    "lint:staged": "lint-staged"
  }
}
```

### 3. 文件化與知識管理

#### 問題類型文件庫
建立並維護常見 linting 問題的處理指引：

```markdown
## 常見問題處理指引

### Q: API 路由中的 `any` 類型如何處理？
A: 既有 API 路由保持現狀。新 API 路由使用具體型別定義。

### Q: 第三方套件的類型問題？
A: 允許使用 `any`，但需要註釋說明原因。

### Q: React Hook 依賴陣列問題？
A: 需要分析是否影響組件行為，不確定時保持現狀。
```

---

## 📈 **成效追蹤與持續改善**

### 關鍵指標（KPI）
1. **錯誤數量趨勢**：目標維持在 10 個以下
2. **新功能程式碼品質**：新程式碼 0 linting 錯誤
3. **既有功能穩定性**：0 因 linting 修改導致的 bug
4. **開發效率影響**：linting 修復時間 < 開發時間 5%

### 定期檢視機制
- **週檢視**：新程式碼 linting 狀況
- **月檢視**：整體 linting 趨勢分析
- **季檢視**：治理策略有效性評估

### 調整機制
當發現治理策略與實際開發需求衝突時：
1. 優先確保系統穩定性
2. 評估調整方案的風險
3. 更新治理規範文件
4. 團隊溝通與訓練

---

## 💡 **最佳實踐建議**

### 對開發團隊的建議

#### 日常開發原則
```typescript
// ✅ 推薦模式：新功能嚴格，既有功能保護
const newFeature = (params: SpecificType) => {
  // 新程式碼使用嚴格型別
}

const existingFeature = (params: any) => { // 保持既有程式碼不變
  // 既有邏輯...
}
```

#### 技術債務管理
- **記錄但不立即修復**：將既有的 linting 問題列入技術債務清單
- **機會導向修復**：配合功能需求順便改善相關程式碼
- **風險評估優先**：優先處理可能影響安全性和效能的問題

#### 知識分享
- 定期分享 linting 最佳實踐
- 建立問題案例集和解決方案
- 新人訓練時強調 Brownfield 約束重要性

---

## 🚨 **緊急應變方案**

### 當 Linting 修改導致系統問題時

#### 立即回應步驟
1. **停止相關修改**：立即停止所有 linting 相關的程式碼變更
2. **系統回滾**：回滾到最後一個穩定版本
3. **影響評估**：評估問題影響範圍和用戶影響
4. **修復方案**：制定最小風險的修復方案

#### 預防措施
- 所有 linting 修改必須經過充分測試
- 建立回滾檢查清單
- 保持詳細的變更記錄

---

## 📚 **相關資源與參考**

### 內部文件連結
- [BROWNFIELD 開發約束](../BROWNFIELD-DEVELOPMENT-CONSTRAINTS.md)
- [程式碼撰寫規範](./coding-standards.md)
- [檔案管理規範](./file-management.md)

### 外部資源
- [ESLint Rules Documentation](https://eslint.org/docs/rules/)
- [TypeScript ESLint Rules](https://typescript-eslint.io/rules/)
- [Next.js ESLint Configuration](https://nextjs.org/docs/basic-features/eslint)

### 工具推薦
- `lint-staged`：針對暫存檔案的 linting
- `husky`：Git hooks 管理
- `eslint-config-prettier`：ESLint 與 Prettier 整合

---

**最後更新：2025-08-20**  
**版本：v1.0**  
**維護者：智能治理專家系統**  
**適用範圍：Corp-Insight Next.js 14 專案**