# 會員系統 UI/UX 設計規範

## 🚨 **BROWNFIELD 開發約束** 🚨

**⚠️ 此設計規範必須遵循全專案 Brownfield 約束：**
**[../../BROWNFIELD-DEVELOPMENT-CONSTRAINTS.md](../../BROWNFIELD-DEVELOPMENT-CONSTRAINTS.md)**

**快速約束摘要：**
- ❌ 絕不修改任何既有 UI 元件、樣式、頁面
- ❌ 絕不變更既有的設計系統或色彩規範
- ✅ 僅允許新增會員功能相關的 UI 元件
- ✅ 必須沿用既有的 Tailwind CSS 設計風格

---

## 🎯 **設計概述**

### 設計原則

1. **一致性優先** - 沿用既有專案的視覺語言
2. **使用者中心** - 簡化登入流程，提升轉換率
3. **安全感營造** - 視覺元素傳達可信度
4. **響應式設計** - 全設備友善的使用體驗

### 設計目標

- **提升登入轉換率** - 目標 >85%
- **降低操作困惑** - 直觀的 UI 引導
- **增強品牌信任** - 專業且一致的視覺呈現
- **優化載入體驗** - 流暢的互動回饋

## 🎨 **設計系統規範**

### 色彩系統（沿用既有）

```scss
// 主要色彩 - 沿用專案既有色彩
$primary-blue: #0056b3;     // 企業藍（Header 主色）
$secondary-blue: #007bff;   // 次要藍色
$accent-amber: #f59e0b;     // 強調琥珀色（AI 工具）
$accent-green: #22c55e;     // 成功綠色（標案）

// 語義化色彩
$success: #22c55e;          // 成功狀態
$warning: #f59e0b;          // 警告狀態
$error: #ef4444;            // 錯誤狀態
$info: #3b82f6;             // 資訊狀態

// 中性色彩（沿用既有）
$gray-50: #f9fafb;
$gray-100: #f3f4f6;
$gray-200: #e5e7eb;
$gray-500: #6b7280;
$gray-700: #374151;
$gray-900: #111827;
```

### 字體系統（沿用既有）

```scss
// 字體大小階層
$text-xs: 0.75rem;      // 12px - 輔助文字
$text-sm: 0.875rem;     // 14px - 說明文字
$text-base: 1rem;       // 16px - 內文
$text-lg: 1.125rem;     // 18px - 子標題
$text-xl: 1.25rem;      // 20px - 標題
$text-2xl: 1.5rem;      // 24px - 大標題
$text-4xl: 2.25rem;     // 36px - 主標題（如 Header）

// 字重
$font-normal: 400;
$font-medium: 500;
$font-semibold: 600;
$font-bold: 700;
```

### 間距系統（沿用既有）

```scss
// Tailwind 標準間距
$spacing-1: 0.25rem;    // 4px
$spacing-2: 0.5rem;     // 8px
$spacing-3: 0.75rem;    // 12px
$spacing-4: 1rem;       // 16px
$spacing-6: 1.5rem;     // 24px
$spacing-8: 2rem;       // 32px
$spacing-12: 3rem;      // 48px
$spacing-16: 4rem;      // 64px
```

## 🔐 **登入頁面設計**

### 頁面佈局

```markdown
┌─────────────────────────────────────────┐
│                Header                    │ ← 沿用既有 Header 元件
├─────────────────────────────────────────┤
│                                         │
│          登入表單區域                     │
│     ┌─────────────────────────┐        │
│     │     會員登入             │        │
│     │                         │        │
│     │  [Google 登入按鈕]       │        │
│     │  [Facebook 登入按鈕]     │        │
│     │  [Line 登入按鈕]         │        │
│     │                         │        │
│     │     ──── 或 ────        │        │
│     │                         │        │
│     │  Email: [_________]      │        │
│     │  密碼:  [_________]      │        │
│     │                         │        │
│     │      [立即登入]          │        │
│     │                         │        │
│     │  還沒有帳號？[立即註冊]    │        │
│     │  忘記密碼？[重設密碼]      │        │
│     └─────────────────────────┘        │
│                                         │
├─────────────────────────────────────────┤
│                Footer                   │ ← 沿用既有 Footer 元件
└─────────────────────────────────────────┘
```

### 登入表單設計

```typescript
// 登入表單元件規範
interface LoginFormDesign {
  container: {
    width: 'max-w-md mx-auto',
    padding: 'px-8 py-12',
    background: 'bg-white',
    border: 'border border-gray-200',
    borderRadius: 'rounded-lg',
    shadow: 'shadow-soft'  // 沿用既有 shadow 定義
  };
  
  title: {
    text: '會員登入',
    className: 'text-2xl font-bold text-gray-900 text-center mb-8'
  };
  
  socialButtons: {
    container: 'space-y-3 mb-6',
    buttonBase: 'w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium transition-colors duration-200'
  };
  
  divider: {
    container: 'relative my-6',
    line: 'absolute inset-0 flex items-center',
    text: 'relative flex justify-center text-sm text-gray-500'
  };
  
  emailForm: {
    container: 'space-y-4',
    inputGroup: 'space-y-1',
    label: 'block text-sm font-medium text-gray-700',
    input: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
  };
}
```

### 社交登入按鈕設計

```scss
// Google 登入按鈕
.google-login-button {
  @apply w-full flex items-center justify-center px-4 py-3;
  @apply border border-gray-300 rounded-lg;
  @apply text-sm font-medium text-gray-700;
  @apply bg-white hover:bg-gray-50;
  @apply transition-colors duration-200;
  
  .google-icon {
    @apply w-5 h-5 mr-3;
  }
}

// Facebook 登入按鈕
.facebook-login-button {
  @apply w-full flex items-center justify-center px-4 py-3;
  @apply border border-blue-600 rounded-lg;
  @apply text-sm font-medium text-white;
  @apply bg-blue-600 hover:bg-blue-700;
  @apply transition-colors duration-200;
  
  .facebook-icon {
    @apply w-5 h-5 mr-3;
  }
}

// Line 登入按鈕
.line-login-button {
  @apply w-full flex items-center justify-center px-4 py-3;
  @apply border border-green-500 rounded-lg;
  @apply text-sm font-medium text-white;
  @apply bg-green-500 hover:bg-green-600;
  @apply transition-colors duration-200;
  
  .line-icon {
    @apply w-5 h-5 mr-3;
  }
}
```

## 📝 **註冊頁面設計**

### 註冊流程步驟

```markdown
步驟 1: 基本資料填寫
┌─────────────────────────────┐
│         建立新帳號           │
│                             │
│  姓名: [_______________]     │
│  Email: [______________]     │
│  密碼: [_______________]     │
│  確認密碼: [____________]     │
│                             │
│  □ 我同意服務條款           │
│  □ 我同意隱私政策           │
│                             │
│       [建立帳號]            │
│                             │
│  已有帳號？[立即登入]        │
└─────────────────────────────┘

步驟 2: Email 驗證
┌─────────────────────────────┐
│        驗證您的 Email        │
│                             │
│  📧 驗證信已發送至           │
│     user@example.com        │
│                             │
│  請點擊信中的連結完成驗證     │
│                             │
│    [重新發送驗證信]          │
│    [變更 Email 地址]         │
└─────────────────────────────┘

步驟 3: 註冊完成
┌─────────────────────────────┐
│         註冊成功！           │
│                             │
│  🎉 歡迎加入企業放大鏡       │
│                             │
│  您現在可以使用所有功能      │
│                             │
│       [開始使用]            │
└─────────────────────────────┘
```

### 表單驗證設計

```typescript
// 即時驗證回饋設計
interface ValidationFeedback {
  email: {
    valid: {
      icon: '✓',
      message: 'Email 格式正確',
      className: 'text-green-600'
    },
    invalid: {
      icon: '✗',
      message: '請輸入有效的 Email 地址',
      className: 'text-red-600'
    },
    taken: {
      icon: '⚠',
      message: '此 Email 已被註冊',
      className: 'text-amber-600'
    }
  };
  
  password: {
    weak: {
      icon: '⚠',
      message: '密碼強度：弱',
      className: 'text-red-600',
      progressBar: 'bg-red-200'
    },
    medium: {
      icon: '⚡',
      message: '密碼強度：中等',
      className: 'text-amber-600',
      progressBar: 'bg-amber-200'
    },
    strong: {
      icon: '✓',
      message: '密碼強度：良好',
      className: 'text-green-600',
      progressBar: 'bg-green-200'
    }
  };
}
```

## 👤 **個人資料頁面設計**

### 頁面佈局

```markdown
┌─────────────────────────────────────────┐
│                Header                    │
├─────────────────────────────────────────┤
│                                         │
│  側邊導航    │        主要內容區          │
│             │                           │
│  個人資料    │    ┌─────────────────────┐ │
│  安全設定    │    │     個人資料         │ │
│  通知設定    │    │                     │ │
│  隱私設定    │    │  大頭照: [頭像]      │ │
│  帳號綁定    │    │  姓名: [________]    │ │
│             │    │  Email: [_______]    │ │
│             │    │  電話: [________]    │ │
│             │    │  公司: [________]    │ │
│             │    │                     │ │
│             │    │      [儲存變更]      │ │
│             │    └─────────────────────┘ │
│                                         │
├─────────────────────────────────────────┤
│                Footer                   │
└─────────────────────────────────────────┘
```

### 大頭照上傳設計

```scss
.avatar-upload {
  @apply relative w-24 h-24 mx-auto mb-4;
  
  .avatar-image {
    @apply w-full h-full rounded-full object-cover;
    @apply border-4 border-gray-200;
  }
  
  .upload-overlay {
    @apply absolute inset-0 rounded-full;
    @apply bg-black bg-opacity-50;
    @apply flex items-center justify-center;
    @apply opacity-0 hover:opacity-100;
    @apply transition-opacity duration-200;
    @apply cursor-pointer;
    
    .upload-icon {
      @apply w-6 h-6 text-white;
    }
  }
}
```

## 🛡️ **後台管理介面設計**

### 會員列表頁面

```markdown
┌─────────────────────────────────────────┐
│            Admin Header                  │ ← 沿用既有 Admin Header
├─────────────────────────────────────────┤
│                                         │
│  [會員管理] [統計儀表板] [系統設定]      │ ← 沿用既有導航樣式
│                                         │
│  ┌─ 搜尋與篩選 ──────────────────────┐  │
│  │ 搜尋: [____________] [🔍]         │  │
│  │ 狀態: [全部▼] 角色: [全部▼]       │  │
│  │ 日期: [____] ~ [____]            │  │
│  └─────────────────────────────────┘  │
│                                         │
│  ┌─ 會員列表 ────────────────────────┐  │
│  │ □ Email        │姓名│狀態│註冊日期 │  │
│  │ ──────────────────────────────── │  │
│  │ □ user@ex.com  │王小明│活躍│2024-01 │  │
│  │ □ test@ex.com  │李小華│停用│2024-02 │  │
│  │ □ demo@ex.com  │張小強│等待│2024-03 │  │
│  └─────────────────────────────────┘  │
│                                         │
│  [< 上一頁] 第 1 頁，共 10 頁 [下一頁 >] │ ← 沿用既有分頁樣式
│                                         │
├─────────────────────────────────────────┤
│                Footer                   │
└─────────────────────────────────────────┘
```

### 會員狀態徽章設計

```scss
.user-status-badge {
  @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
  
  &.active {
    @apply bg-green-100 text-green-800;
  }
  
  &.suspended {
    @apply bg-red-100 text-red-800;
  }
  
  &.pending {
    @apply bg-yellow-100 text-yellow-800;
  }
  
  .status-icon {
    @apply w-3 h-3 mr-1;
  }
}
```

## 📱 **響應式設計規範**

### 斷點定義（沿用既有）

```scss
// Tailwind 標準斷點
$mobile: 'max-width: 767px';      // 手機
$tablet: 'min-width: 768px';      // 平板
$desktop: 'min-width: 1024px';    // 桌面
$large: 'min-width: 1280px';      // 大螢幕
```

### 登入表單響應式調整

```scss
// 桌面版 (預設)
.login-form {
  @apply max-w-md mx-auto px-8 py-12;
}

// 平板版
@media (max-width: 1023px) {
  .login-form {
    @apply max-w-sm px-6 py-10;
  }
}

// 手機版
@media (max-width: 767px) {
  .login-form {
    @apply max-w-full mx-4 px-4 py-8;
    
    .social-buttons {
      @apply space-y-2;
      
      button {
        @apply py-4 text-base;
      }
    }
    
    .form-input {
      @apply py-3 text-base;
    }
  }
}
```

## ⚡ **互動狀態與動畫效果**

### 載入狀態設計

```typescript
// 載入狀態元件規範
interface LoadingStates {
  button: {
    className: 'inline-flex items-center px-4 py-2 disabled:opacity-50',
    spinner: '<svg className="animate-spin h-4 w-4 mr-2">...</svg>',
    text: '處理中...'
  };
  
  form: {
    overlay: 'absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center',
    spinner: '<div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>'
  };
  
  page: {
    skeleton: 'animate-pulse bg-gray-200 rounded',
    container: 'space-y-4 p-4'
  };
}
```

### 過場動畫設計

```scss
// 頁面進入動畫
.page-enter {
  @apply opacity-0 translate-y-4;
  
  &.page-enter-active {
    @apply opacity-100 translate-y-0;
    transition: opacity 300ms ease-in-out, transform 300ms ease-in-out;
  }
}

// 表單驗證動畫
.validation-message {
  @apply opacity-0 scale-95;
  
  &.show {
    @apply opacity-100 scale-100;
    transition: opacity 200ms ease-in-out, transform 200ms ease-in-out;
  }
}

// 按鈕懸停效果
.button-hover {
  @apply transition-all duration-200 ease-in-out;
  @apply hover:shadow-md hover:-translate-y-0.5;
}
```

## 🎭 **微互動設計**

### 成功/錯誤提示設計

```typescript
// 吐司通知設計
interface ToastNotification {
  success: {
    icon: '✓',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-800',
    iconColor: 'text-green-600'
  };
  
  error: {
    icon: '✗',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-800',
    iconColor: 'text-red-600'
  };
  
  warning: {
    icon: '⚠',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-800',
    iconColor: 'text-amber-600'
  };
}
```

### 表單焦點效果

```scss
.form-input {
  @apply w-full px-3 py-2 border rounded-lg;
  @apply transition-all duration-200 ease-in-out;
  
  &:focus {
    @apply ring-2 ring-blue-500 ring-opacity-50;
    @apply border-blue-500 outline-none;
  }
  
  &.error {
    @apply border-red-500 ring-2 ring-red-500 ring-opacity-50;
  }
  
  &.success {
    @apply border-green-500 ring-2 ring-green-500 ring-opacity-50;
  }
}
```

## 🔍 **無障礙設計規範**

### ARIA 標籤設計

```html
<!-- 登入表單無障礙標籤 -->
<form role="form" aria-labelledby="login-title">
  <h2 id="login-title">會員登入</h2>
  
  <div role="group" aria-labelledby="social-login-title">
    <h3 id="social-login-title" class="sr-only">社交媒體登入</h3>
    <button aria-label="使用 Google 帳號登入">
      Google 登入
    </button>
  </div>
  
  <div role="group" aria-labelledby="email-login-title">
    <h3 id="email-login-title" class="sr-only">Email 登入</h3>
    
    <label for="email">Email 地址</label>
    <input 
      id="email" 
      type="email" 
      required 
      aria-describedby="email-error"
      aria-invalid="false"
    />
    <div id="email-error" role="alert" class="sr-only"></div>
    
    <label for="password">密碼</label>
    <input 
      id="password" 
      type="password" 
      required 
      aria-describedby="password-error"
      aria-invalid="false"
    />
    <div id="password-error" role="alert" class="sr-only"></div>
  </div>
  
  <button type="submit" aria-describedby="login-status">
    立即登入
  </button>
  
  <div id="login-status" role="status" aria-live="polite" class="sr-only"></div>
</form>
```

### 鍵盤導航設計

```scss
// 焦點可見性
.focus-visible {
  @apply outline-none ring-2 ring-blue-500 ring-opacity-50;
}

// 跳過連結
.skip-link {
  @apply absolute -top-10 left-4 z-50;
  @apply bg-blue-600 text-white px-4 py-2 rounded;
  @apply transition-all duration-200;
  
  &:focus {
    @apply top-4;
  }
}
```

## 📋 **元件清單與檔案結構**

### 新增元件清單

```
src/components/auth/
├── AuthLayout.tsx              # 認證頁面佈局
├── LoginForm.tsx               # 登入表單
├── RegisterForm.tsx            # 註冊表單
├── SocialLoginButton.tsx       # 社交登入按鈕
├── PasswordStrengthMeter.tsx   # 密碼強度指示器
├── EmailVerification.tsx       # Email 驗證狀態
└── AuthErrorBoundary.tsx       # 認證錯誤邊界

src/components/profile/
├── ProfileLayout.tsx           # 個人資料佈局
├── BasicInfoForm.tsx           # 基本資料表單
├── SecuritySettings.tsx        # 安全設定
├── NotificationSettings.tsx    # 通知設定
├── LinkedAccounts.tsx          # 帳號綁定管理
└── AvatarUpload.tsx           # 大頭照上傳

src/components/admin/users/
├── UserListTable.tsx          # 會員列表表格
├── UserDetailCard.tsx         # 會員詳細資訊
├── UserSearchFilter.tsx       # 搜尋篩選器
├── UserStatusBadge.tsx        # 狀態徽章
├── UserPermissionEditor.tsx   # 權限編輯器
└── UserStatsDashboard.tsx     # 統計儀表板
```

### 樣式檔案結構

```
src/styles/auth/
├── auth-layout.scss           # 認證頁面樣式
├── login-form.scss            # 登入表單樣式
├── social-buttons.scss        # 社交登入按鈕
└── form-validation.scss       # 表單驗證樣式

src/styles/profile/
├── profile-layout.scss        # 個人資料樣式
├── avatar-upload.scss         # 大頭照上傳
└── settings-panel.scss        # 設定面板

src/styles/admin/
├── user-management.scss       # 會員管理樣式
├── status-badges.scss         # 狀態徽章
└── admin-dashboard.scss       # 管理儀表板
```

## 🚀 **實作優先順序**

### Phase 1: 核心登入功能
1. **AuthLayout 元件** - 認證頁面基礎佈局
2. **SocialLoginButton 元件** - Google/Facebook/Line 登入按鈕
3. **LoginForm 元件** - Email/密碼登入表單
4. **基礎樣式系統** - 沿用既有 Tailwind 設定

### Phase 2: 註冊與驗證
1. **RegisterForm 元件** - 註冊表單與驗證
2. **PasswordStrengthMeter 元件** - 密碼強度指示
3. **EmailVerification 元件** - Email 驗證流程
4. **表單驗證動畫** - 即時驗證回饋

### Phase 3: 個人資料管理
1. **ProfileLayout 元件** - 個人資料頁面佈局
2. **BasicInfoForm 元件** - 基本資料編輯
3. **AvatarUpload 元件** - 大頭照上傳功能
4. **SecuritySettings 元件** - 安全設定面板

### Phase 4: 後台管理
1. **UserListTable 元件** - 會員列表與搜尋
2. **UserDetailCard 元件** - 會員詳細資料
3. **UserStatsDashboard 元件** - 統計儀表板
4. **管理介面整合** - 與既有 Admin 系統整合

## 📐 **設計交付規範**

### 設計檔案交付

1. **Figma 設計稿**（建議）
   - 登入/註冊頁面設計
   - 個人資料頁面設計
   - 後台管理介面設計
   - 響應式設計變化

2. **元件庫文件**
   - 所有新增元件的 Props 介面
   - 使用範例與程式碼片段
   - 樣式變體與狀態說明

3. **互動原型**（選用）
   - 登入流程互動原型
   - 表單驗證互動示範
   - 錯誤處理流程展示

### 品質檢核標準

- ✅ **視覺一致性**：與既有專案風格 100% 一致
- ✅ **響應式適配**：三種設備完美顯示
- ✅ **無障礙合規**：符合 WCAG 2.1 AA 標準
- ✅ **效能優化**：載入時間 < 3 秒
- ✅ **瀏覽器相容**：Chrome、Edge 最新兩版

---

**文件版本：** v1.0  
**最後更新：** 2025-08-20  
**設計負責：** UX Expert Sally  
**審核狀態：** 待開發團隊審核  

**相關文件：**
- [會員系統 PRD](./prd/index.md)
- [技術架構文件](./architecture/index.md)
- [Brownfield 開發約束](../../BROWNFIELD-DEVELOPMENT-CONSTRAINTS.md)