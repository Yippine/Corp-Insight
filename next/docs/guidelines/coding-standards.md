# 程式碼撰寫規範

## 語言與用詞規範

### 輸出語言標準

- **主要語言**：台灣繁體中文 (zh-TW)
- **專業術語**：採用台灣資訊業界慣用詞彙
- **適用範圍**：所有程式碼註解、日誌訊息、使用者介面文字、文件撰寫

### 台灣用詞對照表

| 概念   | 台灣用詞 | 避免使用 |
| ------ | -------- | -------- |
| 伺服器 | 伺服器   | 服務器   |
| 資料庫 | 資料庫   | 數據庫   |
| 使用者 | 使用者   | 用戶     |
| 程式碼 | 程式碼   | 代碼     |
| 軟體   | 軟體     | 軟件     |
| 硬體   | 硬體     | 硬件     |
| 網路   | 網路     | 網絡     |
| 介面   | 介面     | 接口     |

## 中文撰寫格式規範

### 標點符號使用規則

- **必須使用中文全形標點符號**：，。！？；：「」『』（）【】
- **避免使用英文半形標點符號**：,.!?;:"()[]

### 全形與半形文字混合規則

#### 1. 中文與英文 / 數字之間需要空格

```markdown
✅ 正確格式

- 使用 Next.js 14 開發前端應用程式
- 資料庫有 1,234 筆企業資料
- 請執行 npm run dev 指令
- 這是 API 回應格式

❌ 錯誤格式

- 使用Next.js 14開發前端應用程式
- 資料庫有1,234筆企業資料
- 請執行npm run dev指令
- 這是API回應格式
```

#### 2. 標點符號與英文 / 數字之間不需要空格

```markdown
✅ 正確格式

- 執行 API 測試，確認回應正確。
- 資料庫連線成功！共找到 95 筆資料。
- 請確認 MongoDB 版本（建議 5.0 以上）

❌ 錯誤格式

- 執行 API 測試 ，確認回應正確 。
- 資料庫連線成功 ！共找到 95 筆資料 。
- 請確認 MongoDB 版本 （建議 5.0 以上）
```

#### 3. 半形符號與中文之間需要空格

```markdown
✅ 正確格式

- 中文與英文 / 數字之間是否有空格
- 支援 HTTP / HTTPS 協定
- 版本 v1.0 / v2.0 對比

❌ 錯誤格式

- 中文與英文/數字之間是否有空格
- 支援HTTP/HTTPS協定
- 版本v1.0/v2.0對比
```

#### 4. 數學運算符號特例規則

數學運算符號與中文或標點符號的空格處理：

```markdown
✅ 正確格式

- 結果為 x + y = 10 的計算
- 如果 a > b 則執行操作
- 當 x === y 時返回 true
- 設定值範圍為 1-100，預設為 50。
- 計算公式：result = (a + b) * c，請確認結果。

❌ 錯誤格式

- 結果為 x+y=10 的計算
- 如果 a>b 則執行操作
- 當 x===y 時返回 true
- 設定值範圍為 1-100 ，預設為 50 。
- 計算公式：result=(a+b)*c ，請確認結果 。
```

**規則說明：**
- 數學運算符號遇到中文字時需要空格
- 數學運算符號遇到全形標點符號時不需要空格
- 運算符號兩側保持一致的空格處理

### 程式碼註解規範

```typescript
// ✅ 正確：使用台灣繁體中文與正確格式
/**
 * 取得使用者的個人資料
 * @param userId 使用者識別碼
 * @returns 使用者資料物件
 */
function getUserProfile(userId: string): UserProfile {
  // 查詢 MongoDB 資料庫中的使用者資料
  const user = database.findUser(userId);

  // 檢查使用者是否存在
  if (!user) {
    throw new Error('找不到使用者資料，請檢查 userId 是否正確。');
  }

  return user;
}

// ❌ 錯誤：格式不符規範
/**
 * 取得使用者的個人資料
 * @param userId使用者識別碼
 * @returns使用者資料物件
 */
function getUserProfile(userId: string): UserProfile {
  //查詢MongoDB資料庫中的使用者資料
  const user = database.findUser(userId);

  //檢查使用者是否存在
  if (!user) {
    throw new Error('找不到使用者資料,請檢查userId是否正確');
  }

  return user;
}
```

### 日誌訊息規範

```typescript
// ✅ 正確：台灣繁體中文與正確格式
console.log('使用者登入成功', { userId: '12345' });
console.error('MongoDB 連線失敗：', error.message);
console.info('API 回應時間：', responseTime, 'ms');
console.warn('Gemini API 金鑰即將達到使用限制，剩餘 10% 配額。');

// ❌ 錯誤：格式不符規範
console.log('使用者登入成功', { userId: '12345' });
console.error('MongoDB連線失敗:', error.message);
console.info('API回應時間:', responseTime, 'ms');
console.warn('Gemini API金鑰即將達到使用限制,剩餘10%配額');
```

## 檔案大小限制規範

### 400 行限制原則

- **所有新建立的規範文件** 必須控制在 400 行以內
- **超過 400 行的檔案** 必須進行拆分
- **檔案拆分** 須遵循功能職責單一原則

### 檔案拆分策略

當檔案接近或超過 400 行時，按以下策略拆分：

1. **按功能模組拆分**

```
development-conventions.md (425 行) →
├── development-workflow.md (核心開發流程)
├── component-standards.md (元件開發規範)
├── api-design-rules.md (API 設計規則)
└── quality-assurance.md (品質保證流程)
```

2. **按職責領域拆分**

```
architecture-guide.md →
├── frontend-architecture.md
├── backend-architecture.md
└── database-architecture.md
```

3. **建立主索引檔案**

```markdown
# development-conventions.md（拆分後的主檔案）

本文件為開發慣例規範總覽，詳細內容請參閱：

- [開發流程規範](./development-workflow.md)
- [元件開發標準](./component-standards.md)
- [API 設計規則](./api-design-rules.md)
- [品質保證流程](./quality-assurance.md)
```

### 檔案大小檢查機制

開發過程中，任何 Agent 或開發者發現檔案超過 400 行時：

1. **必須主動提醒**：「此檔案已超過 400 行限制，建議進行拆分」
2. **提供拆分建議**：基於檔案內容提出具體的拆分方案
3. **經使用者確認後執行**：不可未經同意擅自拆分檔案

## 版本控制註解規範

### Git Commit 訊息

- **WIP 提交**：使用台灣繁體中文簡潔描述
- **正式提交**：使用英文，遵循專案既有 Git 工作流程規範
- **完整 Git 工作流程**：
  - WIP 暫存：`/wip` - 參閱 `.claude/commands/git/README.md`
  - Release 上版：`/release` - 參閱 `.claude/commands/git/README.md`
  - 智能治理：`/govern` - 參閱 `.claude/commands/governance/README.md`
  - BMad 整合：`/bmad-orchestrator` - 參閱 `.claude/commands/BMad/README.md`
- **BMad Method 整合**：符合 `docs/features/README.md` 開發流程

### 範例

```bash
# WIP 提交範例（中文）
git commit -m "新增使用者登入頁面樣式"
git commit -m "完成 API 錯誤處理邏輯"

# 正式提交範例（英文）
git commit -m "[front-end] Implement user authentication page via JWT."
git commit -m "[docs] Update API Documentation Standards"
```

## 檔案命名規範

### 檔案命名原則

- 使用英文命名，以 kebab-case 格式
- 檔案名稱應清楚表達內容用途
- 避免使用縮寫，除非是廣泛認知的技術術語

### 範例

```
✅ 正確命名
- user-authentication.md
- database-migration-guide.md
- api-error-handling.md

❌ 錯誤命名
- auth.md（過於簡略）
- 使用者認證.md（使用中文）
- userAuthenticationAndSessionManagement.md（太長）
```

## 程式碼審查要點

### 語言使用檢查

1. 所有註解是否使用台灣繁體中文
2. 變數命名是否符合英文慣例
3. 使用者介面文字是否為台灣用語
4. 中文格式是否符合標點符號規範

### 格式檢查要點

1. 中文與英文 / 數字之間是否有空格
2. 標點符號是否使用全形符號
3. 標點符號與英文 / 數字之間是否正確（不空格）
4. 半形符號與中文之間是否有空格
5. 連續英文 / 數字是否維持正常間距

### 檔案大小檢查

1. 新檔案是否超過 400 行限制
2. 是否需要進行功能拆分
3. 拆分後的檔案結構是否清晰

### 文件格式檢查

1. Markdown 語法是否正確
2. 程式碼範例是否包含適當註解
3. 表格格式是否完整
4. 中文格式規範是否遵循
