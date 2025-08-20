# 響應式設計策略

## 🚨 **BROWNFIELD 開發約束**

**⚠️ 此設計策略必須遵循全專案 Brownfield 約束：**
**[../../BROWNFIELD-DEVELOPMENT-CONSTRAINTS.md](../../BROWNFIELD-DEVELOPMENT-CONSTRAINTS.md)**

**核心約束：**
- ❌ 絕不修改既有的響應式設計系統或斷點設定
- ✅ 必須沿用既有的 Tailwind CSS 響應式類別
- ✅ 僅為會員功能新增必要的響應式調整

---

## 策略概述

基於 [UI/UX 設計規範](./ui-ux-design-specifications.md) 中的響應式設計規範，本文件定義會員系統跨設備的技術實現策略，確保在不同螢幕尺寸下提供最佳使用體驗。

## 響應式架構設計

### 斷點策略

沿用既有專案的 Tailwind CSS 標準斷點：

```scss
// 既有專案斷點定義 - 不可修改
$breakpoints: {
  'sm': '640px',   // 小型設備
  'md': '768px',   // 平板設備
  'lg': '1024px',  // 桌面設備
  'xl': '1280px',  // 大型桌面
  '2xl': '1536px'  // 超大螢幕
}

// 會員系統使用的主要斷點
$mobile: 'max-width: 767px';      // 手機版
$tablet: 'min-width: 768px';      // 平板版
$desktop: 'min-width: 1024px';    // 桌面版
$large: 'min-width: 1280px';      // 大螢幕版
```

### 響應式容器策略

```scss
// 會員系統容器響應式策略
.membership-container {
  @apply w-full mx-auto px-4;
  
  /* 手機版 */
  @screen sm {
    @apply max-w-sm px-6;
  }
  
  /* 平板版 */
  @screen md {
    @apply max-w-2xl px-8;
  }
  
  /* 桌面版 */
  @screen lg {
    @apply max-w-4xl;
  }
  
  /* 大螢幕版 */
  @screen xl {
    @apply max-w-6xl;
  }
}
```

## 認證頁面響應式設計

### 登入頁面響應式架構

```typescript
// 登入表單響應式元件
interface ResponsiveLoginFormProps {
  className?: string;
}

export function ResponsiveLoginForm({ className }: ResponsiveLoginFormProps) {
  return (
    <div className={cn(
      // 基礎樣式
      "w-full bg-white border border-gray-200 rounded-lg shadow-soft",
      // 手機版
      "mx-4 px-4 py-8",
      // 平板版
      "md:max-w-md md:mx-auto md:px-6 md:py-10",
      // 桌面版
      "lg:max-w-lg lg:px-8 lg:py-12",
      className
    )}>
      {/* 表單內容 */}
    </div>
  );
}
```

### 社交登入按鈕響應式調整

```scss
.social-login-buttons {
  @apply space-y-2;
  
  .social-login-button {
    @apply w-full flex items-center justify-center px-4 py-3 text-sm;
    
    /* 手機版調整 */
    @screen max-md {
      @apply py-4 text-base;
      
      .button-icon {
        @apply w-6 h-6 mr-3;
      }
      
      .button-text {
        @apply font-medium;
      }
    }
    
    /* 平板版以上 */
    @screen md {
      @apply py-3 text-sm;
      
      .button-icon {
        @apply w-5 h-5 mr-2;
      }
    }
  }
}
```

### 表單輸入響應式策略

```scss
.auth-form-input {
  @apply w-full border border-gray-300 rounded-lg transition-all duration-200;
  @apply focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
  
  /* 手機版 */
  @screen max-md {
    @apply px-4 py-3 text-base;
    /* 增加觸控友善的尺寸 */
    min-height: 48px;
  }
  
  /* 平板版以上 */
  @screen md {
    @apply px-3 py-2 text-sm;
    min-height: 40px;
  }
}

.auth-form-label {
  @apply block font-medium text-gray-700 mb-1;
  
  /* 手機版 */
  @screen max-md {
    @apply text-base;
  }
  
  /* 平板版以上 */
  @screen md {
    @apply text-sm;
  }
}
```

## 個人資料頁面響應式設計

### 側邊導航響應式策略

```typescript
// 響應式側邊導航元件
export function ResponsiveProfileSidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* 手機版選單按鈕 */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="開啟選單"
      >
        <MenuIcon className="w-6 h-6" />
      </button>

      {/* 側邊導航 */}
      <aside className={cn(
        // 基礎樣式
        "bg-white border-r border-gray-200",
        // 手機版 - 覆蓋式選單
        "md:hidden fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        // 平板版以上 - 固定側邊欄
        "md:block md:relative md:translate-x-0 md:w-64 lg:w-72"
      )}>
        <ProfileNavigationMenu />
      </aside>

      {/* 手機版遮罩 */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black bg-opacity-50"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
```

### 個人資料表單響應式佈局

```scss
.profile-form {
  @apply space-y-6;
  
  .form-section {
    @apply bg-white p-6 rounded-lg border border-gray-200;
    
    /* 手機版 */
    @screen max-md {
      @apply p-4;
    }
  }
  
  .form-grid {
    /* 基礎單欄佈局 */
    @apply grid grid-cols-1 gap-4;
    
    /* 平板版 - 雙欄佈局 */
    @screen md {
      @apply grid-cols-2 gap-6;
    }
    
    /* 大螢幕 - 三欄佈局（選擇性） */
    @screen xl {
      &.three-column {
        @apply grid-cols-3;
      }
    }
  }
  
  .form-field-full {
    @apply md:col-span-2 xl:col-span-3;
  }
}
```

### 大頭照上傳響應式調整

```scss
.avatar-upload-container {
  @apply flex flex-col items-center;
  
  .avatar-preview {
    @apply relative rounded-full border-4 border-gray-200 overflow-hidden;
    
    /* 手機版 */
    @screen max-md {
      @apply w-32 h-32;
    }
    
    /* 平板版以上 */
    @screen md {
      @apply w-24 h-24;
    }
    
    /* 大螢幕 */
    @screen lg {
      @apply w-28 h-28;
    }
  }
  
  .upload-button {
    @apply mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg;
    
    /* 手機版 */
    @screen max-md {
      @apply px-6 py-3 text-base;
    }
    
    /* 平板版以上 */
    @screen md {
      @apply px-4 py-2 text-sm;
    }
  }
}
```

## 後台管理響應式設計

### 會員列表表格響應式策略

```typescript
// 響應式會員列表元件
export function ResponsiveUserTable({ users }: { users: User[] }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  if (isMobile) {
    return <UserCardList users={users} />;
  }

  return <UserDataTable users={users} />;
}

// 手機版卡片佈局
function UserCardList({ users }: { users: User[] }) {
  return (
    <div className="space-y-4">
      {users.map(user => (
        <div key={user.id} className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <UserAvatar user={user} size="sm" />
              <div>
                <h3 className="font-medium text-gray-900">{user.name}</h3>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
            <UserStatusBadge status={user.status} />
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>註冊日期: {formatDate(user.createdAt)}</span>
            <UserQuickActions user={user} />
          </div>
        </div>
      ))}
    </div>
  );
}

// 桌面版表格佈局
function UserDataTable({ users }: { users: User[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        {/* 表格內容 */}
      </table>
    </div>
  );
}
```

### 管理操作響應式調整

```scss
.admin-actions {
  @apply flex gap-2;
  
  /* 手機版 - 垂直堆疊 */
  @screen max-md {
    @apply flex-col space-y-2;
    
    .action-button {
      @apply w-full justify-center py-3;
    }
  }
  
  /* 平板版以上 - 水平排列 */
  @screen md {
    @apply flex-row space-x-2;
    
    .action-button {
      @apply px-4 py-2;
    }
  }
}

.admin-search-filter {
  @apply bg-white p-4 border border-gray-200 rounded-lg;
  
  .filter-grid {
    /* 手機版 - 單欄佈局 */
    @apply grid grid-cols-1 gap-4;
    
    /* 平板版 - 雙欄佈局 */
    @screen md {
      @apply grid-cols-2 gap-6;
    }
    
    /* 桌面版 - 四欄佈局 */
    @screen lg {
      @apply grid-cols-4;
    }
  }
}
```

## 導航系統響應式設計

### 主導航響應式策略

```scss
.main-navigation {
  @apply bg-white border-b border-gray-200;
  
  .nav-container {
    @apply flex items-center justify-between px-4 py-3;
    
    /* 平板版以上 */
    @screen md {
      @apply px-6 py-4;
    }
  }
  
  .nav-logo {
    @apply flex items-center;
    
    img {
      /* 手機版 */
      @screen max-md {
        @apply h-8;
      }
      
      /* 平板版以上 */
      @screen md {
        @apply h-10;
      }
    }
  }
  
  .nav-menu {
    /* 手機版 - 隱藏 */
    @apply hidden;
    
    /* 平板版以上 - 顯示 */
    @screen md {
      @apply flex items-center space-x-6;
    }
  }
  
  .nav-user-menu {
    @apply flex items-center space-x-2;
    
    /* 手機版 */
    @screen max-md {
      .user-name {
        @apply hidden;
      }
    }
    
    /* 平板版以上 */
    @screen md {
      @apply space-x-3;
      
      .user-name {
        @apply block;
      }
    }
  }
}
```

### 麵包屑導航響應式策略

```typescript
// 響應式麵包屑元件
export function ResponsiveBreadcrumb({ items }: { items: BreadcrumbItem[] }) {
  const [showFullPath, setShowFullPath] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile && items.length > 3) {
    return (
      <nav className="flex items-center space-x-2 text-sm">
        <Link href={items[0].href} className="text-blue-600 hover:text-blue-800">
          {items[0].label}
        </Link>
        <ChevronRightIcon className="w-4 h-4 text-gray-400" />
        
        {!showFullPath && (
          <>
            <button
              onClick={() => setShowFullPath(true)}
              className="text-gray-500 hover:text-gray-700"
            >
              ...
            </button>
            <ChevronRightIcon className="w-4 h-4 text-gray-400" />
          </>
        )}
        
        {(showFullPath ? items : items.slice(-1)).map((item, index) => (
          <React.Fragment key={item.href}>
            {index > 0 && <ChevronRightIcon className="w-4 h-4 text-gray-400" />}
            {item.href ? (
              <Link href={item.href} className="text-blue-600 hover:text-blue-800">
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-900 font-medium">{item.label}</span>
            )}
          </React.Fragment>
        ))}
      </nav>
    );
  }

  return (
    <nav className="flex items-center space-x-2 text-sm">
      {items.map((item, index) => (
        <React.Fragment key={item.href}>
          {index > 0 && <ChevronRightIcon className="w-4 h-4 text-gray-400" />}
          {item.href ? (
            <Link href={item.href} className="text-blue-600 hover:text-blue-800">
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 font-medium">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
```

## 互動元素響應式優化

### 觸控友善設計

```scss
// 觸控友善的互動元素
.touch-target {
  /* 最小觸控尺寸 44px */
  min-height: 44px;
  min-width: 44px;
  
  /* 手機版增加觸控區域 */
  @screen max-md {
    @apply p-3;
    min-height: 48px;
    min-width: 48px;
  }
  
  /* 平板版以上標準尺寸 */
  @screen md {
    @apply p-2;
    min-height: 40px;
    min-width: 40px;
  }
}

.button-responsive {
  @apply inline-flex items-center justify-center font-medium rounded-lg transition-colors;
  
  /* 手機版 */
  @screen max-md {
    @apply px-6 py-3 text-base;
    min-height: 48px;
  }
  
  /* 平板版以上 */
  @screen md {
    @apply px-4 py-2 text-sm;
    min-height: 40px;
  }
}
```

### 下拉選單響應式設計

```typescript
// 響應式下拉選單元件
export function ResponsiveDropdown({ 
  trigger, 
  children,
  alignment = 'left' 
}: ResponsiveDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) {
    return (
      <>
        <button onClick={() => setIsOpen(true)}>
          {trigger}
        </button>
        
        {isOpen && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50">
            <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">選項</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>
              {children}
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </button>
      
      {isOpen && (
        <div className={cn(
          "absolute top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-40",
          alignment === 'right' ? 'right-0' : 'left-0'
        )}>
          {children}
        </div>
      )}
    </div>
  );
}
```

## 效能優化策略

### 響應式圖片處理

```typescript
// 響應式大頭照元件
export function ResponsiveAvatar({ 
  user, 
  size = 'md' 
}: ResponsiveAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12 md:w-10 md:h-10',
    lg: 'w-16 h-16 md:w-14 md:h-14',
    xl: 'w-24 h-24 md:w-20 md:h-20'
  };

  return (
    <div className={cn(
      'relative rounded-full overflow-hidden bg-gray-200',
      sizeClasses[size]
    )}>
      {user.avatar ? (
        <Image
          src={user.avatar}
          alt={user.name}
          fill
          sizes="(max-width: 768px) 96px, 80px"
          className="object-cover"
          priority={size === 'xl'}
        />
      ) : (
        <div className="flex items-center justify-center h-full bg-gray-300 text-gray-600 font-medium">
          {user.name?.charAt(0)?.toUpperCase()}
        </div>
      )}
    </div>
  );
}
```

### 條件式載入策略

```typescript
// 響應式元件載入
export function ConditionalLoader() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  // 避免 hydration 不一致
  if (isMobile === null) {
    return <div className="animate-pulse bg-gray-200 h-96 w-full rounded-lg" />;
  }

  return isMobile ? <MobileComponent /> : <DesktopComponent />;
}

// 使用動態 import 減少初始載入
const MobileComponent = lazy(() => import('./MobileUserTable'));
const DesktopComponent = lazy(() => import('./DesktopUserTable'));
```

## 測試策略

### 響應式測試工具

```typescript
// 響應式測試工具函數
export function renderWithBreakpoint(
  component: React.ReactElement,
  breakpoint: 'mobile' | 'tablet' | 'desktop' = 'desktop'
) {
  const widths = {
    mobile: 375,
    tablet: 768,
    desktop: 1024
  };

  // 設定視窗尺寸
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: widths[breakpoint],
  });

  window.dispatchEvent(new Event('resize'));

  return render(component);
}

// 響應式元件測試
describe('ResponsiveLoginForm', () => {
  it('should adapt layout for mobile', () => {
    renderWithBreakpoint(<ResponsiveLoginForm />, 'mobile');
    
    const form = screen.getByRole('form');
    expect(form).toHaveClass('mx-4', 'px-4', 'py-8');
  });

  it('should adapt layout for desktop', () => {
    renderWithBreakpoint(<ResponsiveLoginForm />, 'desktop');
    
    const form = screen.getByRole('form');
    expect(form).toHaveClass('max-w-lg', 'px-8', 'py-12');
  });
});
```

---

**相關文件：**
- [UI/UX 設計規範](./ui-ux-design-specifications.md)
- [前端元件架構](./frontend-component-architecture.md)
- [無障礙設計架構](./accessibility-architecture.md)
- [技術整合設計](./technical-integration.md)