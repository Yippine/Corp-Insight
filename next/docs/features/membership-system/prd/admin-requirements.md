# 後台管理需求

## 🚨 **BROWNFIELD 開發約束** 🚨

**⚠️ 此後台管理設計必須遵循全專案 Brownfield 約束：**
**[../../../BROWNFIELD-DEVELOPMENT-CONSTRAINTS.md](../../../BROWNFIELD-DEVELOPMENT-CONSTRAINTS.md)**

---

本文件定義會員管理系統的後台管理需求，基於現有 Admin 架構無縫整合，提供完整的會員管理、監控與安全功能。

## 🎯 功能概述

### 核心管理功能
1. **會員管理**：查看、搜尋、管理所有會員帳號
2. **權限管理**：管理 Root、Admin、User 角色與權限
3. **統計儀表板**：會員註冊、活躍度、安全統計
4. **審計記錄**：完整的操作記錄與安全事件追蹤
5. **系統整合**：與現有 Sitemap、Database 管理整合

### 技術整合原則
- **沿用既有架構**：遵循現有 `/admin` 路由與元件結構
- **權限驗證機制**：使用現有 `ADMIN_SECRET_TOKEN` 模式
- **UI/UX 一致性**：採用現有 Admin 介面設計風格
- **API 端點模式**：遵循現有 `/api/admin/*` 結構

## 🏗️ 架構整合設計

### 與現有 Admin 系統整合

#### 目錄結構整合
```
src/app/admin/
├── layout.tsx              # 既有：Admin 佈局（不修改）
├── sitemap/               # 既有：Sitemap 管理（不修改）
│   ├── layout.tsx
│   └── page.tsx
├── database/              # 既有：Database 管理（不修改）
│   ├── layout.tsx
│   └── page.tsx
└── users/                 # 🆕 新增：會員管理
    ├── layout.tsx         # 新增：會員管理佈局
    ├── page.tsx          # 新增：會員列表頁面
    ├── [id]/             # 新增：會員詳細頁面
    │   └── page.tsx
    └── dashboard/         # 新增：會員統計儀表板
        └── page.tsx
```

#### 元件結構整合
```
src/components/admin/
├── TerminalViewer.tsx         # 既有：終端檢視器（不修改）
├── DatabaseConsole.tsx       # 既有：資料庫控制台（不修改）
├── SitemapConsole.tsx        # 既有：Sitemap 控制台（不修改）
├── UserManagement/           # 🆕 新增：會員管理元件群組
│   ├── UserListTable.tsx     # 新增：會員列表表格
│   ├── UserDetailCard.tsx    # 新增：會員詳細資訊卡片
│   ├── UserSearchFilter.tsx  # 新增：會員搜尋篩選器
│   ├── UserStatusManager.tsx # 新增：會員狀態管理
│   └── UserPermissionEditor.tsx # 新增：權限編輯器
└── Dashboard/                # 🆕 新增：統計儀表板元件
    ├── UserStatsDashboard.tsx # 新增：會員統計儀表板
    ├── SecurityStatCard.tsx   # 新增：安全統計卡片
    └── ActivityTimeline.tsx   # 新增：活動時間軸
```

#### API 端點整合
```
src/app/api/admin/
├── run-script/route.ts        # 既有：腳本執行（不修改）
├── database-stats/route.ts    # 既有：資料庫統計（不修改）
├── backup-stats/route.ts      # 既有：備份統計（不修改）
└── users/                     # 🆕 新增：會員管理 API
    ├── route.ts              # 新增：會員列表/建立
    ├── [id]/route.ts         # 新增：會員詳細/更新/刪除
    ├── [id]/status/route.ts  # 新增：會員狀態管理
    ├── dashboard/route.ts    # 新增：統計儀表板資料
    └── audit-logs/route.ts   # 新增：審計記錄
```

## 👥 會員管理功能需求

### 會員列表管理

#### 列表顯示功能
```typescript
interface UserListItem {
  id: string;
  email: string;
  name: string;
  role: 'root' | 'admin' | 'user';
  status: 'active' | 'suspended' | 'pending_verification';
  createdAt: Date;
  lastLoginAt?: Date;
  loginCount: number;
  emailVerified: boolean;
  linkedProviders: string[]; // ['google', 'facebook', 'line']
}
```

#### 搜尋與篩選功能
1. **文字搜尋**
   - Email 地址搜尋（支援模糊匹配）
   - 顯示名稱搜尋
   - ID 精確搜尋

2. **狀態篩選**
   - 帳號狀態：Active、Suspended、Pending Verification
   - 角色篩選：Root、Admin、User
   - Email 驗證狀態：已驗證、未驗證
   - 登入方式：本地帳號、社交登入

3. **時間範圍篩選**
   - 註冊日期範圍
   - 最後登入時間範圍
   - 自訂時間區間

#### 批量操作功能
```typescript
interface BatchOperation {
  action: 'suspend' | 'activate' | 'delete' | 'export';
  userIds: string[];
  reason?: string;      // 操作原因（用於審計）
  confirmationCode?: string; // 危險操作確認碼
}
```

### 會員詳細資料管理

#### 基本資訊顯示
```typescript
interface UserDetailView {
  // 基本資料
  basicInfo: {
    id: string;
    email: string;
    name: string;
    image?: string;
    role: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  };
  
  // 認證資訊
  authInfo: {
    emailVerified: boolean;
    emailVerifiedAt?: Date;
    passwordLastChanged?: Date;
    twoFactorEnabled: boolean;
    linkedAccounts: LinkedAccount[];
  };
  
  // 活動統計
  activityStats: {
    loginCount: number;
    lastLoginAt?: Date;
    lastLoginIP?: string;
    sessionCount: number;
    failedLoginCount: number;
  };
  
  // 個人資料
  profile: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    company?: string;
    jobTitle?: string;
    preferences: UserPreferences;
  };
}
```

#### 管理操作功能
1. **狀態管理**
   - 啟用/停用帳號
   - 強制 Email 重新驗證
   - 重置密碼（發送重置信）
   - 撤銷所有 Sessions

2. **權限管理**
   - 角色變更（User ↔ Admin）
   - 特定權限調整
   - 權限歷史記錄

3. **安全操作**
   - 查看登入歷史
   - 查看安全事件
   - 強制登出所有設備
   - 鎖定/解鎖帳號

### 會員狀態管理

#### 狀態變更流程
```typescript
interface StatusChangeRequest {
  userId: string;
  newStatus: 'active' | 'suspended' | 'pending_verification';
  reason: string;          // 必填：變更原因
  adminNotes?: string;     // 選填：管理員備註
  notifyUser: boolean;     // 是否通知使用者
  duration?: number;       // 停用期限（小時）
}
```

#### 批量狀態管理
- **安全確認機制**：危險操作需要二次確認
- **原因記錄**：所有狀態變更都要記錄原因
- **通知機制**：可選擇是否通知受影響使用者
- **回滾功能**：支援狀態變更的回滾操作

## 📊 統計儀表板需求

### 核心統計指標

#### 會員統計數據
```typescript
interface UserStatistics {
  // 基本統計
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  pendingUsers: number;
  
  // 增長統計
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  userGrowthRate: number;
  
  // 活躍度統計
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  avgSessionDuration: number;
  
  // 認證統計
  emailVerificationRate: number;
  passwordUsers: number;
  socialLoginUsers: number;
  twoFactorUsers: number;
}
```

#### 登入統計數據
```typescript
interface LoginStatistics {
  // 成功登入
  totalLogins: number;
  successfulLogins: number;
  failedLogins: number;
  loginSuccessRate: number;
  
  // 登入方式分佈
  methodDistribution: {
    password: number;
    google: number;
    facebook: number;
    line: number;
  };
  
  // 時間趨勢
  hourlyLoginTrend: Array<{hour: number, count: number}>;
  dailyLoginTrend: Array<{date: string, count: number}>;
  
  // 地理分佈
  topLoginLocations: Array<{country: string, count: number}>;
  suspiciousLoginAttempts: number;
}
```

### 圖表與視覺化

#### 註冊趨勢圖表
```typescript
interface RegistrationTrendChart {
  type: 'line' | 'bar';
  timeframe: 'daily' | 'weekly' | 'monthly';
  data: Array<{
    period: string;
    registrations: number;
    emailVerifications: number;
  }>;
}
```

#### 活躍度分析圖表
```typescript
interface ActivityAnalysisChart {
  // 使用者活躍度熱圖
  activityHeatmap: Array<{
    hour: number;
    day: number;
    activity: number;
  }>;
  
  // 留存率分析
  retentionAnalysis: {
    day1: number;
    day7: number;
    day30: number;
  };
}
```

### 即時監控面板

#### 警報與通知
```typescript
interface AdminAlert {
  id: string;
  type: 'security' | 'performance' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: Date;
  status: 'active' | 'acknowledged' | 'resolved';
  
  // 安全警報特定欄位
  affectedUsers?: string[];
  threatLevel?: string;
  recommendedAction?: string;
}
```

#### 即時活動監控
- **目前線上使用者**：即時顯示當前活躍會員數
- **登入活動流**：最近登入/登出事件的即時串流
- **系統健康狀態**：認證系統的健康度指標
- **API 呼叫統計**：會員相關 API 的使用統計

## 🔍 審計記錄需求

### 操作記錄追蹤

#### 管理員操作記錄
```typescript
interface AdminOperationLog {
  id: string;
  adminUserId: string;
  adminEmail: string;
  operation: string;           // 操作類型
  targetType: 'user' | 'system' | 'settings';
  targetId?: string;          // 目標資源 ID
  
  // 操作詳細
  operationDetails: {
    before?: any;             // 變更前狀態
    after?: any;              // 變更後狀態
    reason?: string;          // 操作原因
    notes?: string;           // 管理員備註
  };
  
  // 請求資訊
  ipAddress: string;
  userAgent: string;
  sessionId: string;
  
  // 系統資訊
  timestamp: Date;
  success: boolean;
  errorMessage?: string;
}
```

#### 使用者行為記錄
```typescript
interface UserActivityLog {
  id: string;
  userId: string;
  userEmail: string;
  
  // 活動資訊
  activity: 'login' | 'logout' | 'password_change' | 'profile_update' | 'account_link';
  details: {
    method?: string;          // 登入方式
    provider?: string;        // OAuth 提供者
    changes?: string[];       // 變更欄位列表
    oldValues?: any;          // 舊值（敏感資料遮罩）
    newValues?: any;          // 新值（敏感資料遮罩）
  };
  
  // 環境資訊
  ipAddress: string;
  userAgent: string;
  location?: string;
  deviceFingerprint?: string;
  
  // 安全分析
  riskScore: number;          // 0-100 風險評分
  flags: string[];           // 安全標記
  
  timestamp: Date;
}
```

### 審計查詢與分析

#### 查詢篩選功能
```typescript
interface AuditLogFilter {
  // 時間範圍
  startDate?: Date;
  endDate?: Date;
  
  // 操作類型
  operations?: string[];
  
  // 使用者篩選
  adminIds?: string[];
  userIds?: string[];
  
  // 風險等級
  minRiskScore?: number;
  
  // 成功狀態
  success?: boolean;
  
  // 關鍵字搜尋
  searchText?: string;
  
  // 分頁
  page: number;
  limit: number;
}
```

#### 分析報告功能
1. **操作頻率分析**：統計各類操作的執行頻率
2. **風險趨勢分析**：識別安全風險的變化趨勢
3. **使用者行為分析**：異常行為模式識別
4. **合規報告**：產生符合法規要求的審計報告

## 🛡️ 權限管理需求

### 角色權限體系

#### 權限矩陣設計
```typescript
interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'user_management' | 'system_admin' | 'security' | 'reporting';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface RolePermissionMatrix {
  root: {
    // 最高權限：所有操作
    all: true;
    canCreateAdmin: true;
    canDeleteAdmin: true;
    canViewAuditLogs: true;
    canSystemSettings: true;
  };
  
  admin: {
    // 會員管理權限
    canViewUsers: boolean;
    canEditUsers: boolean;
    canSuspendUsers: boolean;
    canDeleteUsers: boolean;
    canExportUserData: boolean;
    
    // 系統管理權限
    canViewDashboard: boolean;
    canRunBackup: boolean;
    canRestoreDatabase: boolean;
    canViewSystemLogs: boolean;
    
    // 安全管理權限
    canViewSecurityLogs: boolean;
    canManageSessions: boolean;
    canResetUserPasswords: boolean;
  };
}
```

#### 權限檢查機制
```typescript
// 權限檢查中介軟體
async function checkPermission(
  adminUserId: string, 
  requiredPermission: string,
  targetResourceId?: string
): Promise<boolean> {
  const admin = await getAdminUser(adminUserId);
  
  if (admin.role === 'root') {
    return true; // Root 擁有所有權限
  }
  
  // 檢查特定權限
  if (!admin.permissions[requiredPermission]) {
    await logUnauthorizedAccess(adminUserId, requiredPermission);
    return false;
  }
  
  // 資源特定權限檢查
  if (targetResourceId) {
    return await checkResourcePermission(adminUserId, targetResourceId);
  }
  
  return true;
}
```

### 權限管理介面

#### 權限編輯功能
1. **角色權限檢視**：清楚顯示各角色的權限範圍
2. **權限批量調整**：支援批量開啟/關閉特定權限
3. **權限變更記錄**：完整記錄所有權限變更歷史
4. **權限衝突檢測**：自動檢測並提示權限設定衝突

#### 權限申請流程
```typescript
interface PermissionRequest {
  requesterId: string;
  targetUserId: string;
  requestedPermissions: string[];
  reason: string;
  businessJustification: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approverId?: string;
  approvedAt?: Date;
  expiryDate?: Date;
}
```

## 🔧 系統整合需求

### 與現有功能整合

#### 導航選單整合
```typescript
// 擴充現有 Admin 導航
interface AdminNavigation {
  existing: [
    { path: '/admin/sitemap', title: 'Sitemap 管理', icon: 'Map' },
    { path: '/admin/database', title: 'Database 管理', icon: 'Database' }
  ];
  
  new: [
    { 
      path: '/admin/users', 
      title: '會員管理', 
      icon: 'Users',
      permissions: ['canViewUsers']
    },
    { 
      path: '/admin/users/dashboard', 
      title: '會員統計', 
      icon: 'BarChart',
      permissions: ['canViewDashboard']
    }
  ];
}
```

#### 權限驗證整合
```typescript
// 沿用現有的 ADMIN_SECRET_TOKEN 驗證
async function verifyAdminToken(request: NextRequest): Promise<boolean> {
  const authToken = request.headers.get('Authorization')?.split(' ')[1];
  const adminSecretToken = process.env.ADMIN_SECRET_TOKEN;
  
  if (!adminSecretToken || authToken !== adminSecretToken) {
    return false;
  }
  
  return true;
}

// 新增：基於角色的權限檢查
async function verifyAdminPermission(
  request: NextRequest, 
  requiredPermission: string
): Promise<{ authorized: boolean; adminUser?: AdminUser }> {
  const isValidToken = await verifyAdminToken(request);
  if (!isValidToken) {
    return { authorized: false };
  }
  
  // 從 token 或 session 取得 admin 使用者資訊
  const adminUser = await getAdminFromRequest(request);
  const hasPermission = await checkPermission(adminUser.id, requiredPermission);
  
  return { 
    authorized: hasPermission, 
    adminUser: hasPermission ? adminUser : undefined 
  };
}
```

### UI/UX 一致性要求

#### 設計風格整合
```typescript
// 沿用現有 Admin 介面元件風格
interface AdminUIComponents {
  // 使用現有元件
  terminalViewer: 'TerminalViewer';    // 用於顯示批量操作結果
  loadingStates: 'InlineLoading';      // 統一載入狀態
  
  // 新增會員管理專用元件（遵循現有風格）
  userManagement: {
    listTable: 'UserListTable';        // 會員列表表格
    detailCard: 'UserDetailCard';      // 會員詳細資訊卡片
    statusBadge: 'UserStatusBadge';    // 狀態標籤
    permissionChip: 'PermissionChip';  // 權限標籤
  };
}
```

#### 響應式設計要求
- **桌面優先**：主要針對桌面環境優化（1920x1080+）
- **平板適配**：支援平板環境使用（768px+）
- **一致性佈局**：與現有 admin 頁面保持佈局一致性

## 📱 使用者體驗需求

### 操作效率優化

#### 快速操作功能
1. **鍵盤快捷鍵**：支援常用操作的鍵盤快捷鍵
2. **批量選擇**：支援 Shift+Click 連續選擇
3. **快速篩選**：預設篩選條件快速切換
4. **歷史操作**：記住管理員的常用操作和篩選條件

#### 資料載入優化
1. **分頁載入**：大量資料分頁顯示（預設 20 筆/頁）
2. **虛擬滾動**：大列表採用虛擬滾動技術
3. **快取機制**：合理快取查詢結果
4. **即時更新**：重要資料變更的即時推送

### 錯誤處理與回饋

#### 操作確認機制
```typescript
interface OperationConfirmation {
  // 一般操作：簡單確認
  simple: {
    message: string;
    confirmButton: string;
    cancelButton: string;
  };
  
  // 危險操作：多重確認
  critical: {
    message: string;
    warningText: string;
    confirmationText: string;    // 使用者需要輸入的確認文字
    confirmButton: string;
    cancelButton: string;
  };
}
```

#### 操作結果回饋
1. **成功通知**：操作成功的明確提示
2. **錯誤處理**：詳細的錯誤資訊與建議解決方案
3. **進度指示**：長時間操作的進度顯示
4. **結果摘要**：批量操作的結果摘要

---

**相關文件：**
- [API 設計規格](./api-specifications.md)
- [使用者角色定義](./user-roles.md)
- [安全合規規格](./security-compliance.md)
- [資料模型規格](./data-models.md)