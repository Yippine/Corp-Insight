# 前端元件架構設計

## 🚨 **BROWNFIELD 開發約束**

**⚠️ 此架構設計必須遵循全專案 Brownfield 約束：**
**[../../BROWNFIELD-DEVELOPMENT-CONSTRAINTS.md](../../BROWNFIELD-DEVELOPMENT-CONSTRAINTS.md)**

**核心約束：**
- ❌ 絕不修改任何既有 UI 元件、樣式、頁面  
- ✅ 僅允許新增會員功能相關的 UI 元件
- ✅ 必須沿用既有的 Tailwind CSS 設計風格

---

## 架構概述

基於 [UI/UX 設計規範](./ui-ux-design-specifications.md)，本文件定義會員系統前端元件的技術架構實現策略。

### 設計原則

1. **功能導向組織** - 按功能模組組織元件，提高開發效率
2. **設計系統一致性** - 嚴格遵循既有專案視覺語言  
3. **實用主義** - 避免過度抽象，專注可維護性
4. **職責清晰** - 每個元件有明確的單一職責
5. **易於理解** - 元件命名和組織讓開發者快速定位
6. **效能優化** - 適當使用 memo、lazy loading 等最佳化技術

## 元件架構設計

### 業界最佳實踐架構

基於企業級會員系統的標準架構，採用實用的功能導向組織方式：

```typescript
// 認證相關核心元件
interface LoginFormProps {
  onEmailLogin: (credentials: LoginCredentials) => Promise<void>;
  onSocialLogin: (provider: 'google' | 'facebook' | 'line') => Promise<void>;
  redirectTo?: string;
  errors?: AuthErrors;
}

interface RegisterFormProps {
  onRegister: (data: RegisterData) => Promise<void>;
  onSocialRegister: (provider: SocialProvider) => Promise<void>;
  termsAccepted: boolean;
  onTermsChange: (accepted: boolean) => void;
}

interface SocialLoginProps {
  onGoogleLogin: () => void;
  onFacebookLogin: () => void;
  onLineLogin: () => void;
  loading?: {
    google?: boolean;
    facebook?: boolean;
    line?: boolean;
  };
}

interface ResetPasswordFormProps {
  onSubmit: (email: string) => Promise<void>;
  isLoading: boolean;
  error?: string;
}

// 管理介面核心元件
interface UserManagementTableProps {
  users: User[];
  pagination: PaginationState;
  filters: UserFilters;
  onUserAction: (action: UserAction, userId: string) => void;
  onFiltersChange: (filters: UserFilters) => void;
}

interface UserDetailCardProps {
  user: User;
  onUpdate: (updates: Partial<User>) => Promise<void>;
  onPermissionChange: (permissions: Permission[]) => Promise<void>;
  isLoading: boolean;
}

// 佈局與通用元件
interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
}

interface UserStatusBadgeProps {
  status: 'active' | 'suspended' | 'pending';
  size: 'sm' | 'md' | 'lg';
}
```

## 元件檔案結構

採用業界標準的功能導向組織架構：

```
src/components/auth/
├── LoginForm.tsx                # 完整登入表單（含 Email + 社交登入）
├── RegisterForm.tsx             # 完整註冊表單（含驗證與條款）
├── SocialLogin.tsx              # 社交登入按鈕組（Google/Facebook/Line）
├── ResetPasswordForm.tsx        # 密碼重置表單
├── EmailVerification.tsx        # Email 驗證狀態與重發
├── AuthLayout.tsx               # 認證頁面統一佈局
├── PasswordStrengthMeter.tsx    # 密碼強度指示器
└── index.ts                     # 統一匯出

src/components/admin/membership/
├── UserManagementTable.tsx      # 會員管理列表（含篩選、分頁）
├── UserDetailCard.tsx           # 會員詳細資料卡片
├── UserStatusBadge.tsx          # 會員狀態徽章
├── UserPermissionEditor.tsx     # 權限編輯器
├── UserQuickActions.tsx         # 快速操作選單（啟用/停用/重置）
├── UserSearchFilter.tsx         # 搜尋與篩選器
├── UserBulkActions.tsx          # 批量操作工具
└── index.ts                     # 統一匯出

src/components/profile/
├── ProfileForm.tsx              # 個人資料編輯表單
├── PasswordChangeForm.tsx       # 密碼變更表單
├── AccountSettings.tsx          # 帳號設定（通知、隱私）
├── ConnectedAccounts.tsx        # 已連結的社交帳號管理
└── index.ts                     # 統一匯出

src/components/common/
├── LoadingSpinner.tsx           # 載入指示器
├── ErrorBoundary.tsx            # 錯誤邊界
├── FormField.tsx                # 通用表單欄位
├── Modal.tsx                    # 通用彈窗
└── index.ts                     # 統一匯出
```

## 狀態管理架構

### Context Providers 架構

```typescript
// 認證狀態管理
interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  refreshToken: () => Promise<void>;
}

// 載入狀態管理  
interface LoadingContextValue {
  loadingStates: Record<string, boolean>;
  setLoading: (key: string, loading: boolean) => void;
  isAnyLoading: boolean;
}

// 通知狀態管理
interface NotificationContextValue {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
}
```

### Provider 架構設計

```typescript
// 認證 Provider 架構
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // NextAuth.js 整合
  const { data: session, status } = useSession();
  
  useEffect(() => {
    if (status === 'loading') return;
    if (session?.user) {
      setUser(session.user as User);
    }
    setIsLoading(false);
  }, [session, status]);

  const contextValue: AuthContextValue = {
    user,
    isLoading,
    login: async (credentials) => {
      // 使用 NextAuth signIn
      const result = await signIn('credentials', {
        ...credentials,
        redirect: false,
      });
      if (result?.error) throw new Error(result.error);
    },
    logout: async () => {
      await signOut({ redirect: false });
      setUser(null);
    },
    // ... 其他方法
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}
```

## 樣式架構設計

### Tailwind CSS 整合策略

基於既有專案的 Tailwind 設定，擴展會員系統所需樣式：

```scss
// 會員系統專用樣式擴展
@layer components {
  /* 認證表單樣式 */
  .auth-form {
    @apply max-w-md mx-auto px-8 py-12 bg-white border border-gray-200 rounded-lg shadow-soft;
  }
  
  .auth-form-title {
    @apply text-2xl font-bold text-gray-900 text-center mb-8;
  }
  
  /* 社交登入按鈕樣式 */
  .social-login-button {
    @apply w-full flex items-center justify-center px-4 py-3 border rounded-lg text-sm font-medium transition-colors duration-200;
  }
  
  .social-login-button--google {
    @apply border-gray-300 text-gray-700 bg-white hover:bg-gray-50;
  }
  
  .social-login-button--facebook {
    @apply border-blue-600 text-white bg-blue-600 hover:bg-blue-700;
  }
  
  .social-login-button--line {
    @apply border-green-500 text-white bg-green-500 hover:bg-green-600;
  }
  
  /* 表單輸入樣式 */
  .form-input {
    @apply w-full px-3 py-2 border border-gray-300 rounded-lg transition-all duration-200;
    @apply focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none;
  }
  
  .form-input--error {
    @apply border-red-500 ring-2 ring-red-500 ring-opacity-50;
  }
  
  .form-input--success {
    @apply border-green-500 ring-2 ring-green-500 ring-opacity-50;
  }
  
  /* 使用者狀態徽章 */
  .user-status-badge {
    @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
  }
  
  .user-status-badge--active {
    @apply bg-green-100 text-green-800;
  }
  
  .user-status-badge--suspended {
    @apply bg-red-100 text-red-800;
  }
  
  .user-status-badge--pending {
    @apply bg-yellow-100 text-yellow-800;
  }
}

/* 動畫擴展 */
@layer utilities {
  .animate-slide-in {
    animation: slideIn 300ms ease-in-out;
  }
  
  .animate-fade-in {
    animation: fadeIn 200ms ease-in-out;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(1rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

## Hook 架構設計

### 自訂 Hook 設計

```typescript
// 認證相關 Hooks
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function useLogin() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleLogin = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      await login(credentials);
    } catch (err) {
      setError(err instanceof Error ? err.message : '登入失敗');
    } finally {
      setIsLoading(false);
    }
  };
  
  return { handleLogin, isLoading, error };
}

// 表單驗證 Hook
export function useFormValidation<T>(
  initialValues: T,
  validationRules: ValidationRules<T>
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  
  const validateField = (field: keyof T, value: any) => {
    const rules = validationRules[field];
    if (!rules) return null;
    
    for (const rule of rules) {
      if (!rule.validator(value)) {
        return rule.message;
      }
    }
    return null;
  };
  
  const setValue = (field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    
    // 即時驗證
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: error || undefined }));
    }
  };
  
  return {
    values,
    errors,
    touched,
    setValue,
    setTouched,
    isValid: Object.keys(errors).length === 0,
  };
}

// 管理員操作 Hook
export function useAdminActions() {
  const [isLoading, setIsLoading] = useState(false);
  
  const performAction = async (
    action: AdminAction,
    payload: any
  ) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error('操作失敗');
      }
      
      return await response.json();
    } finally {
      setIsLoading(false);
    }
  };
  
  return { performAction, isLoading };
}
```

## 錯誤處理架構

### 錯誤邊界設計

```typescript
interface AuthErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class AuthErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  AuthErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): AuthErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('認證錯誤:', error, errorInfo);
    
    // 發送錯誤到監控服務
    this.logErrorToService(error, errorInfo);
  }

  private logErrorToService(error: Error, errorInfo: React.ErrorInfo) {
    // 整合錯誤監控服務
    fetch('/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
      }),
    }).catch(console.error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-soft">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                發生錯誤
              </h2>
              <p className="text-gray-600 mb-6">
                認證系統出現問題，請重新整理頁面或聯絡管理員。
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                重新整理
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## 效能優化策略

### 程式碼分割與懶載入

```typescript
// 路由層級的程式碼分割
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));

// 大型元件的懶載入
const UserListTable = lazy(() => import('./organisms/UserListTable'));
const PermissionEditor = lazy(() => import('./organisms/PermissionEditor'));

// 條件式載入
const AdminComponents = lazy(() => 
  import('./admin/index').then(module => ({
    default: module.AdminComponents
  }))
);

// Suspense 包裝
function AuthRoutes() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/admin/*" element={<AdminPage />} />
      </Routes>
    </Suspense>
  );
}
```

### 元件效能優化

```typescript
// React.memo 優化
export const UserTableRow = React.memo<UserTableRowProps>(({ user, onAction }) => {
  return (
    <tr className="border-b border-gray-200">
      {/* 表格列內容 */}
    </tr>
  );
}, (prevProps, nextProps) => {
  // 自訂比較函數
  return prevProps.user.id === nextProps.user.id &&
         prevProps.user.status === nextProps.user.status;
});

// useMemo 優化計算
function UserStatistics({ users }: { users: User[] }) {
  const statistics = useMemo(() => {
    return {
      total: users.length,
      active: users.filter(u => u.status === 'active').length,
      pending: users.filter(u => u.status === 'pending').length,
      suspended: users.filter(u => u.status === 'suspended').length,
    };
  }, [users]);

  return (
    <div className="grid grid-cols-4 gap-4">
      {/* 統計顯示 */}
    </div>
  );
}

// useCallback 優化事件處理
function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  
  const handleUserAction = useCallback((action: UserAction, userId: string) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === userId 
          ? { ...user, status: action === 'suspend' ? 'suspended' : 'active' }
          : user
      )
    );
  }, []);

  return (
    <UserListTable 
      users={users} 
      onUserAction={handleUserAction}
    />
  );
}
```

## 測試架構

### 元件測試策略

```typescript
// 認證表單測試
describe('LoginForm', () => {
  it('should render all form fields', () => {
    render(<LoginForm onEmailLogin={jest.fn()} onSocialLogin={jest.fn()} />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/密碼/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /登入/i })).toBeInTheDocument();
  });

  it('should validate email format', async () => {
    const mockLogin = jest.fn();
    render(<LoginForm onEmailLogin={mockLogin} onSocialLogin={jest.fn()} />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /登入/i });
    
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);
    
    expect(await screen.findByText(/無效的 email 格式/i)).toBeInTheDocument();
    expect(mockLogin).not.toHaveBeenCalled();
  });
});

// Hook 測試
describe('useAuth', () => {
  it('should provide authentication state', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <AuthProvider>{children}</AuthProvider>
      ),
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(typeof result.current.login).toBe('function');
  });
});
```

---

**相關文件：**
- [UI/UX 設計規範](./ui-ux-design-specifications.md)
- [響應式設計策略](./responsive-design-strategy.md)
- [無障礙設計架構](./accessibility-architecture.md)
- [技術整合設計](./technical-integration.md)