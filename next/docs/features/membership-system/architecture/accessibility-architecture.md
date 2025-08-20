# 無障礙設計架構

## 🚨 **BROWNFIELD 開發約束**

**⚠️ 此設計架構必須遵循全專案 Brownfield 約束：**
**[../../BROWNFIELD-DEVELOPMENT-CONSTRAINTS.md](../../BROWNFIELD-DEVELOPMENT-CONSTRAINTS.md)**

**核心約束：**
- ❌ 絕不修改既有的無障礙設定或 ARIA 標籤
- ✅ 為會員功能新增完整的無障礙支援
- ✅ 必須符合既有專案的無障礙標準

---

## 架構概述

基於 [UI/UX 設計規範](./ui-ux-design-specifications.md) 中的無障礙設計規範，本文件定義會員系統的無障礙功能技術架構實現，確保符合 **WCAG 2.1 AA 級標準**。

### 無障礙設計原則

1. **可感知性 (Perceivable)** - 資訊和UI元件必須能被使用者感知
2. **可操作性 (Operable)** - UI元件和導航必須可操作
3. **可理解性 (Understandable)** - 資訊和UI操作必須可理解
4. **穩健性 (Robust)** - 內容必須能被各種輔助技術解讀

## ARIA 標籤架構設計

### 認證表單 ARIA 結構

```typescript
// 無障礙登入表單元件
interface AccessibleLoginFormProps {
  onSubmit: (credentials: LoginCredentials) => Promise<void>;
  errors?: LoginErrors;
  isLoading?: boolean;
}

export function AccessibleLoginForm({ 
  onSubmit, 
  errors, 
  isLoading 
}: AccessibleLoginFormProps) {
  const formId = useId();
  const emailErrorId = useId();
  const passwordErrorId = useId();
  const statusId = useId();

  return (
    <form 
      id={formId}
      role="form" 
      aria-labelledby={`${formId}-title`}
      onSubmit={handleSubmit}
    >
      {/* 表單標題 */}
      <h2 
        id={`${formId}-title`}
        className="text-2xl font-bold text-gray-900 text-center mb-8"
      >
        會員登入
      </h2>

      {/* 社交登入區塊 */}
      <div 
        role="group" 
        aria-labelledby={`${formId}-social-title`}
        className="mb-6"
      >
        <h3 
          id={`${formId}-social-title`}
          className="sr-only"
        >
          社交媒體登入選項
        </h3>
        
        <SocialLoginButton
          provider="google"
          onClick={() => onSocialLogin('google')}
          aria-label="使用 Google 帳號登入"
          disabled={isLoading}
        />
        
        <SocialLoginButton
          provider="facebook"
          onClick={() => onSocialLogin('facebook')}
          aria-label="使用 Facebook 帳號登入"
          disabled={isLoading}
        />
        
        <SocialLoginButton
          provider="line"
          onClick={() => onSocialLogin('line')}
          aria-label="使用 Line 帳號登入"
          disabled={isLoading}
        />
      </div>

      {/* 分隔線 */}
      <div role="separator" aria-label="或者使用 Email 登入" className="my-6">
        <span className="text-gray-500">或</span>
      </div>

      {/* Email 登入區塊 */}
      <div 
        role="group" 
        aria-labelledby={`${formId}-email-title`}
        className="space-y-4"
      >
        <h3 
          id={`${formId}-email-title`}
          className="sr-only"
        >
          Email 帳號登入
        </h3>
        
        {/* Email 輸入 */}
        <div>
          <label 
            htmlFor={`${formId}-email`}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email 地址
            <span className="text-red-500 ml-1" aria-label="必填欄位">*</span>
          </label>
          <input
            id={`${formId}-email`}
            type="email"
            required
            autoComplete="email"
            aria-describedby={errors?.email ? emailErrorId : undefined}
            aria-invalid={errors?.email ? 'true' : 'false'}
            className="form-input"
            disabled={isLoading}
          />
          {errors?.email && (
            <div 
              id={emailErrorId}
              role="alert" 
              className="mt-1 text-sm text-red-600"
              aria-live="polite"
            >
              <span className="sr-only">錯誤：</span>
              {errors.email}
            </div>
          )}
        </div>

        {/* 密碼輸入 */}
        <div>
          <label 
            htmlFor={`${formId}-password`}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            密碼
            <span className="text-red-500 ml-1" aria-label="必填欄位">*</span>
          </label>
          <input
            id={`${formId}-password`}
            type="password"
            required
            autoComplete="current-password"
            aria-describedby={errors?.password ? passwordErrorId : undefined}
            aria-invalid={errors?.password ? 'true' : 'false'}
            className="form-input"
            disabled={isLoading}
          />
          {errors?.password && (
            <div 
              id={passwordErrorId}
              role="alert" 
              className="mt-1 text-sm text-red-600"
              aria-live="polite"
            >
              <span className="sr-only">錯誤：</span>
              {errors.password}
            </div>
          )}
        </div>
      </div>

      {/* 提交按鈕 */}
      <button
        type="submit"
        disabled={isLoading}
        aria-describedby={statusId}
        className="w-full mt-6 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <span className="sr-only">登入處理中，請稍候</span>
            <span aria-hidden="true">處理中...</span>
          </>
        ) : (
          '立即登入'
        )}
      </button>

      {/* 狀態訊息 */}
      <div 
        id={statusId}
        role="status" 
        aria-live="polite" 
        className="sr-only"
      >
        {isLoading && '正在處理登入請求'}
      </div>

      {/* 輔助連結 */}
      <div className="mt-6 text-center space-y-2">
        <p className="text-sm text-gray-600">
          還沒有帳號？
          <a 
            href="/auth/register"
            className="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
          >
            立即註冊
          </a>
        </p>
        <p className="text-sm text-gray-600">
          忘記密碼？
          <a 
            href="/auth/forgot-password"
            className="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
          >
            重設密碼
          </a>
        </p>
      </div>
    </form>
  );
}
```

### 表單驗證 ARIA 實現

```typescript
// 無障礙表單驗證 Hook
export function useAccessibleValidation<T>(
  initialValues: T,
  validationRules: ValidationRules<T>
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [announcements, setAnnouncements] = useState<string[]>([]);

  const validateField = useCallback((field: keyof T, value: any) => {
    const rules = validationRules[field];
    if (!rules) return null;

    for (const rule of rules) {
      if (!rule.validator(value)) {
        return rule.message;
      }
    }
    return null;
  }, [validationRules]);

  const setValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));

    // 即時驗證與無障礙通知
    const error = validateField(field, value);
    setErrors(prev => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[field] = error;
        // 為螢幕閱讀器添加錯誤通知
        setAnnouncements(prev => [...prev, `${String(field)} 欄位：${error}`]);
      } else {
        delete newErrors[field];
        // 錯誤修正通知
        if (prev[field]) {
          setAnnouncements(prev => [...prev, `${String(field)} 欄位已修正`]);
        }
      }
      return newErrors;
    });
  }, [validateField]);

  // 清理通知訊息
  useEffect(() => {
    if (announcements.length > 0) {
      const timer = setTimeout(() => {
        setAnnouncements([]);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [announcements]);

  return {
    values,
    errors,
    announcements,
    setValue,
    isValid: Object.keys(errors).length === 0,
  };
}

// 無障礙通知元件
export function AccessibilityAnnouncer({ announcements }: { announcements: string[] }) {
  return (
    <div 
      role="log" 
      aria-live="polite" 
      aria-label="表單驗證訊息"
      className="sr-only"
    >
      {announcements.map((message, index) => (
        <div key={index}>{message}</div>
      ))}
    </div>
  );
}
```

## 鍵盤導航架構

### 焦點管理策略

```typescript
// 焦點管理 Hook
export function useFocusManagement() {
  const [focusedElementId, setFocusedElementId] = useState<string | null>(null);
  const focusStackRef = useRef<string[]>([]);

  const pushFocus = useCallback((elementId: string) => {
    if (focusedElementId) {
      focusStackRef.current.push(focusedElementId);
    }
    setFocusedElementId(elementId);
    
    // 實際設定焦點
    const element = document.getElementById(elementId);
    if (element) {
      element.focus();
    }
  }, [focusedElementId]);

  const popFocus = useCallback(() => {
    const previousFocusId = focusStackRef.current.pop();
    if (previousFocusId) {
      setFocusedElementId(previousFocusId);
      const element = document.getElementById(previousFocusId);
      if (element) {
        element.focus();
      }
    }
  }, []);

  const trapFocus = useCallback((containerId: string) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    const focusableElements = container.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    focusedElementId,
    pushFocus,
    popFocus,
    trapFocus,
  };
}

// 可訪問的模態對話框元件
export function AccessibleModal({ 
  isOpen, 
  onClose, 
  title, 
  children 
}: AccessibleModalProps) {
  const { trapFocus, pushFocus, popFocus } = useFocusManagement();
  const modalId = useId();
  const titleId = useId();
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // 保存當前焦點
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // 設定焦點陷阱
      const cleanup = trapFocus(modalId);
      
      // 焦點移至模態對話框
      setTimeout(() => {
        const modal = document.getElementById(modalId);
        if (modal) {
          modal.focus();
        }
      }, 0);

      return cleanup;
    } else {
      // 恢復之前的焦點
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }
  }, [isOpen, modalId, trapFocus]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black bg-opacity-50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div 
        id={modalId}
        className="fixed inset-0 flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 
              id={titleId}
              className="text-lg font-semibold text-gray-900"
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              aria-label="關閉對話框"
              className="p-2 hover:bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
```

### 鍵盤快捷鍵系統

```typescript
// 鍵盤快捷鍵 Hook
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const { key, ctrlKey, altKey, shiftKey, callback } = shortcut;
        
        if (
          event.key === key &&
          event.ctrlKey === !!ctrlKey &&
          event.altKey === !!altKey &&
          event.shiftKey === !!shiftKey
        ) {
          event.preventDefault();
          callback();
          break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

// 管理頁面快捷鍵實現
export function AdminKeyboardShortcuts() {
  useKeyboardShortcuts([
    {
      key: '/',
      callback: () => {
        const searchInput = document.getElementById('user-search');
        if (searchInput) {
          searchInput.focus();
        }
      },
      description: '焦點移至搜尋框'
    },
    {
      key: 'n',
      altKey: true,
      callback: () => {
        // 開啟新增使用者對話框
        const newUserButton = document.getElementById('new-user-button');
        if (newUserButton) {
          newUserButton.click();
        }
      },
      description: '新增使用者'
    },
    {
      key: 'h',
      altKey: true,
      callback: () => {
        // 顯示快捷鍵說明
        const helpButton = document.getElementById('help-button');
        if (helpButton) {
          helpButton.click();
        }
      },
      description: '顯示說明'
    }
  ]);

  return null; // 此元件僅處理鍵盤事件
}

// 快捷鍵說明對話框
export function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);

  const shortcuts = [
    { key: '/', description: '搜尋使用者' },
    { key: 'Alt + N', description: '新增使用者' },
    { key: 'Alt + H', description: '顯示此說明' },
    { key: 'Tab', description: '移至下一個元素' },
    { key: 'Shift + Tab', description: '移至上一個元素' },
    { key: 'Enter/Space', description: '啟動按鈕或連結' },
    { key: 'Esc', description: '關閉對話框或選單' }
  ];

  return (
    <>
      <button
        id="help-button"
        onClick={() => setIsOpen(true)}
        aria-label="顯示鍵盤快捷鍵說明"
        className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
      >
        <QuestionMarkCircleIcon className="w-5 h-5" />
      </button>

      <AccessibleModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="鍵盤快捷鍵"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            使用以下快捷鍵可提升操作效率：
          </p>
          <dl className="space-y-2">
            {shortcuts.map((shortcut, index) => (
              <div key={index} className="flex justify-between">
                <dt className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                  {shortcut.key}
                </dt>
                <dd className="text-sm text-gray-700 ml-4">
                  {shortcut.description}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </AccessibleModal>
    </>
  );
}
```

## 螢幕閱讀器支援

### ARIA Live Regions 實現

```typescript
// 無障礙通知系統
interface NotificationContextValue {
  notifications: AccessibleNotification[];
  addNotification: (notification: Omit<AccessibleNotification, 'id'>) => void;
  removeNotification: (id: string) => void;
}

export function AccessibleNotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AccessibleNotification[]>([]);

  const addNotification = useCallback((notification: Omit<AccessibleNotification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);

    // 自動移除通知
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, notification.duration || 5000);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const contextValue: NotificationContextValue = {
    notifications,
    addNotification,
    removeNotification,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <AccessibleNotificationContainer />
    </NotificationContext.Provider>
  );
}

// 無障礙通知容器
function AccessibleNotificationContainer() {
  const { notifications } = useNotification();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {/* 視覺通知 */}
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={cn(
            'p-4 rounded-lg shadow-lg',
            {
              'bg-green-50 border border-green-200 text-green-800': notification.type === 'success',
              'bg-red-50 border border-red-200 text-red-800': notification.type === 'error',
              'bg-amber-50 border border-amber-200 text-amber-800': notification.type === 'warning',
              'bg-blue-50 border border-blue-200 text-blue-800': notification.type === 'info',
            }
          )}
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {notification.type === 'success' && <CheckCircleIcon className="w-5 h-5" />}
              {notification.type === 'error' && <XCircleIcon className="w-5 h-5" />}
              {notification.type === 'warning' && <ExclamationTriangleIcon className="w-5 h-5" />}
              {notification.type === 'info' && <InformationCircleIcon className="w-5 h-5" />}
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium">
                {notification.title}
              </p>
              {notification.message && (
                <p className="mt-1 text-sm">
                  {notification.message}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* 螢幕閱讀器專用區域 */}
      <div 
        role="log" 
        aria-live="polite" 
        aria-label="系統通知"
        className="sr-only"
      >
        {notifications.map(notification => (
          <div key={`sr-${notification.id}`}>
            {notification.type === 'error' && '錯誤：'}
            {notification.type === 'warning' && '警告：'}
            {notification.type === 'success' && '成功：'}
            {notification.type === 'info' && '資訊：'}
            {notification.title}
            {notification.message && ` - ${notification.message}`}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 語意化 HTML 結構

```typescript
// 語意化會員列表元件
export function SemanticUserTable({ users, pagination }: SemanticUserTableProps) {
  const tableId = useId();
  const captionId = useId();

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* 表格標題和描述 */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 
          id={captionId}
          className="text-lg font-semibold text-gray-900"
        >
          會員列表
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          共 {pagination.total} 位會員，第 {pagination.currentPage} 頁
        </p>
      </div>

      {/* 表格容器 */}
      <div 
        role="region" 
        aria-labelledby={captionId}
        className="overflow-x-auto"
      >
        <table 
          id={tableId}
          className="min-w-full"
          role="table"
          aria-describedby={captionId}
        >
          <caption className="sr-only">
            會員資料表格，包含姓名、Email、狀態和註冊日期資訊
          </caption>
          
          <thead className="bg-gray-50">
            <tr role="row">
              <th 
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                aria-sort="none"
              >
                <button 
                  className="flex items-center space-x-1 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                  aria-label="按姓名排序"
                >
                  <span>姓名</span>
                  <SortIcon className="w-4 h-4" />
                </button>
              </th>
              <th 
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Email
              </th>
              <th 
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                狀態
              </th>
              <th 
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                aria-sort="descending"
              >
                <button 
                  className="flex items-center space-x-1 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                  aria-label="按註冊日期排序，目前為降序"
                >
                  <span>註冊日期</span>
                  <SortDescIcon className="w-4 h-4" />
                </button>
              </th>
              <th 
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                <span className="sr-only">操作</span>
                操作
              </th>
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user, index) => (
              <tr 
                key={user.id}
                role="row"
                className="hover:bg-gray-50"
                aria-rowindex={index + 2}
              >
                <td 
                  className="px-6 py-4 whitespace-nowrap"
                  role="gridcell"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img
                        className="h-10 w-10 rounded-full"
                        src={user.avatar || '/default-avatar.png'}
                        alt=""
                        role="presentation"
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.name}
                      </div>
                    </div>
                  </div>
                </td>
                
                <td 
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                  role="gridcell"
                >
                  {user.email}
                </td>
                
                <td 
                  className="px-6 py-4 whitespace-nowrap"
                  role="gridcell"
                >
                  <UserStatusBadge 
                    status={user.status}
                    aria-label={`使用者狀態：${getStatusText(user.status)}`}
                  />
                </td>
                
                <td 
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                  role="gridcell"
                >
                  <time dateTime={user.createdAt}>
                    {formatDate(user.createdAt)}
                  </time>
                </td>
                
                <td 
                  className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                  role="gridcell"
                >
                  <UserActionMenu 
                    user={user}
                    aria-label={`${user.name} 的操作選單`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 分頁導航 */}
      <AccessiblePagination 
        pagination={pagination}
        aria-label="會員列表分頁導航"
      />
    </div>
  );
}
```

## 色彩對比與視覺設計

### 高對比模式支援

```scss
// 高對比模式樣式
@media (prefers-contrast: high) {
  .auth-form {
    @apply border-2 border-gray-900;
    
    .form-input {
      @apply border-2 border-gray-700;
      
      &:focus {
        @apply border-blue-700 ring-4 ring-blue-200;
      }
    }
    
    .button-primary {
      @apply bg-blue-800 border-2 border-blue-900;
      
      &:hover {
        @apply bg-blue-900;
      }
    }
  }
  
  .user-status-badge {
    @apply border-2;
    
    &--active {
      @apply bg-green-200 text-green-900 border-green-800;
    }
    
    &--suspended {
      @apply bg-red-200 text-red-900 border-red-800;
    }
    
    &--pending {
      @apply bg-yellow-200 text-yellow-900 border-yellow-800;
    }
  }
}

// 減少動畫設定
@media (prefers-reduced-motion: reduce) {
  .animate-slide-in,
  .animate-fade-in,
  .transition-all,
  .transition-colors {
    animation: none !important;
    transition: none !important;
  }
  
  .hover\\:scale-105:hover {
    transform: none !important;
  }
}
```

### 焦點可見性增強

```scss
// 自訂焦點樣式
.focus-visible {
  @apply outline-none ring-2 ring-blue-500 ring-offset-2 ring-offset-white;
  
  // 高對比模式下的焦點樣式
  @media (prefers-contrast: high) {
    @apply ring-4 ring-blue-700 ring-offset-4;
  }
}

// 跳過連結樣式
.skip-link {
  @apply absolute -top-10 left-4 z-50;
  @apply bg-blue-600 text-white px-4 py-2 rounded;
  @apply transition-all duration-200;
  @apply focus:top-4 focus:outline-none focus:ring-2 focus:ring-white;
  
  &:focus {
    clip: auto;
    width: auto;
    height: auto;
  }
}

// 螢幕閱讀器專用類別
.sr-only {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}
```

## 無障礙測試架構

### 自動化無障礙測試

```typescript
// 無障礙測試工具
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

// 元件無障礙測試
describe('AccessibleLoginForm', () => {
  it('should not have accessibility violations', async () => {
    const { container } = render(
      <AccessibleLoginForm 
        onSubmit={jest.fn()}
        errors={{}}
        isLoading={false}
      />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have proper ARIA labels', () => {
    render(<AccessibleLoginForm onSubmit={jest.fn()} />);
    
    expect(screen.getByRole('form')).toHaveAttribute('aria-labelledby');
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/密碼/i)).toBeInTheDocument();
  });

  it('should announce errors to screen readers', async () => {
    const { rerender } = render(
      <AccessibleLoginForm onSubmit={jest.fn()} errors={{}} />
    );

    rerender(
      <AccessibleLoginForm 
        onSubmit={jest.fn()} 
        errors={{ email: '請輸入有效的 Email 地址' }} 
      />
    );

    expect(screen.getByRole('alert')).toHaveTextContent('請輸入有效的 Email 地址');
  });
});

// 鍵盤導航測試
describe('Keyboard Navigation', () => {
  it('should handle tab navigation correctly', () => {
    render(<AccessibleLoginForm onSubmit={jest.fn()} />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/密碼/i);
    const submitButton = screen.getByRole('button', { name: /登入/i });

    // 模擬 tab 導航
    userEvent.tab();
    expect(emailInput).toHaveFocus();

    userEvent.tab();
    expect(passwordInput).toHaveFocus();

    userEvent.tab();
    expect(submitButton).toHaveFocus();
  });

  it('should trap focus in modal dialogs', () => {
    render(
      <AccessibleModal isOpen={true} onClose={jest.fn()} title="測試對話框">
        <button>第一個按鈕</button>
        <button>最後一個按鈕</button>
      </AccessibleModal>
    );

    const firstButton = screen.getByText('第一個按鈕');
    const lastButton = screen.getByText('最後一個按鈕');

    // 模擬 Shift+Tab 在第一個元素上
    firstButton.focus();
    userEvent.keyboard('{Shift>}{Tab}{/Shift}');
    expect(lastButton).toHaveFocus();

    // 模擬 Tab 在最後一個元素上
    userEvent.keyboard('{Tab}');
    expect(firstButton).toHaveFocus();
  });
});
```

### 無障礙檢核清單

```typescript
// 無障礙檢核工具
export const AccessibilityChecklist = {
  // WCAG 2.1 AA 檢核項目
  checkContrast: (element: HTMLElement) => {
    // 檢查色彩對比度
  },
  
  checkFocusVisible: (element: HTMLElement) => {
    // 檢查焦點可見性
  },
  
  checkAriaLabels: (container: HTMLElement) => {
    // 檢查 ARIA 標籤完整性
  },
  
  checkKeyboardAccess: (container: HTMLElement) => {
    // 檢查鍵盤可訪問性
  },
  
  checkSemanticHTML: (container: HTMLElement) => {
    // 檢查語意化 HTML 結構
  },
  
  // 執行完整檢核
  runFullAudit: async (container: HTMLElement) => {
    const results = await axe(container, {
      rules: {
        'color-contrast': { enabled: true },
        'focus-order-semantics': { enabled: true },
        'keyboard': { enabled: true },
        'aria-labels': { enabled: true },
      }
    });
    
    return {
      violations: results.violations,
      passes: results.passes,
      incomplete: results.incomplete,
    };
  }
};
```

---

**相關文件：**
- [UI/UX 設計規範](./ui-ux-design-specifications.md)
- [前端元件架構](./frontend-component-architecture.md) 
- [響應式設計策略](./responsive-design-strategy.md)
- [技術整合設計](./technical-integration.md)