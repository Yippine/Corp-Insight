# 資料模型規格

本文件定義會員管理系統的 MongoDB Collections 結構設計，基於 Payload CMS + NextAuth.js 架構。

## 核心 Collections

### Users Collection
主要會員資料表，整合前台使用者與後台管理員。

```javascript
// users collection
{
  _id: ObjectId,
  email: String, // 主要識別，唯一索引
  emailVerified: Date, // NextAuth 標準欄位
  name: String, // 顯示名稱
  image: String, // 頭像 URL (來自 OAuth 或上傳)
  role: String, // 'root' | 'admin' | 'user'
  status: String, // 'active' | 'suspended' | 'pending_verification'
  
  // 權限設定 (主要用於 admin 角色)
  permissions: {
    view_users: Boolean,
    edit_users: Boolean,
    run_db_restore: Boolean,
    manage_sitemap: Boolean,
    view_audit_logs: Boolean
  },
  
  // 個人資訊
  profile: {
    firstName: String,
    lastName: String,
    phone: String,
    company: String,
    jobTitle: String,
    timezone: String // 預設 'Asia/Taipei'
  },
  
  // 帳號設定
  preferences: {
    language: String, // 預設 'zh-TW'
    emailNotifications: Boolean,
    twoFactorEnabled: Boolean
  },
  
  // 會員等級 (未來擴充用)
  membership: {
    tier: String, // 'free' | 'pro'
    subscriptionStatus: String,
    subscriptionDate: Date,
    expiryDate: Date
  },
  
  // 系統追蹤欄位
  createdAt: Date,
  updatedAt: Date,
  lastLoginAt: Date,
  loginCount: Number,
  
  // 密碼相關 (僅本地註冊使用)
  password: String, // bcrypt hashed
  passwordResetToken: String,
  passwordResetExpires: Date,
  
  // Email 驗證
  emailVerificationToken: String,
  emailVerificationExpires: Date
}

// 索引設定
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ role: 1 })
db.users.createIndex({ status: 1 })
db.users.createIndex({ createdAt: 1 })
db.users.createIndex({ lastLoginAt: 1 })
```

### Accounts Collection
NextAuth.js OAuth 帳號綁定資料表。

```javascript
// accounts collection (NextAuth 標準)
{
  _id: ObjectId,
  userId: ObjectId, // 關聯至 users._id
  type: String, // 'oauth' | 'credentials'
  provider: String, // 'google' | 'facebook' | 'credentials'
  providerAccountId: String, // OAuth provider 的使用者 ID
  
  // OAuth tokens
  refresh_token: String,
  access_token: String,
  expires_at: Number,
  token_type: String,
  scope: String,
  id_token: String,
  session_state: String,
  
  // 系統欄位
  createdAt: Date,
  updatedAt: Date
}

// 索引設定
db.accounts.createIndex({ userId: 1 })
db.accounts.createIndex({ provider: 1, providerAccountId: 1 }, { unique: true })
```

### Sessions Collection  
NextAuth.js Session 管理資料表。

```javascript
// sessions collection (NextAuth 標準)
{
  _id: ObjectId,
  sessionToken: String, // 唯一 session 識別
  userId: ObjectId, // 關聯至 users._id
  expires: Date, // Session 過期時間
  
  // 額外追蹤資訊
  userAgent: String,
  ipAddress: String,
  loginMethod: String, // 'oauth' | 'credentials'
  
  // 系統欄位
  createdAt: Date,
  updatedAt: Date
}

// 索引設定
db.sessions.createIndex({ sessionToken: 1 }, { unique: true })
db.sessions.createIndex({ userId: 1 })
db.sessions.createIndex({ expires: 1 }) // TTL 索引
```

### Verification Tokens Collection
Email 驗證與密碼重置 Token 管理。

```javascript
// verificationtokens collection (NextAuth 標準)
{
  _id: ObjectId,
  identifier: String, // email 地址
  token: String, // 驗證 token
  expires: Date, // Token 過期時間
  type: String, // 'email_verification' | 'password_reset'
  
  // 系統欄位
  createdAt: Date
}

// 索引設定
db.verificationtokens.createIndex({ identifier: 1, token: 1 }, { unique: true })
db.verificationtokens.createIndex({ expires: 1 }) // TTL 索引
```

## 系統管理 Collections

### Audit Logs Collection
系統操作審計記錄。

```javascript
// audit_logs collection
{
  _id: ObjectId,
  userId: ObjectId, // 操作者 ID
  action: String, // 操作類型
  resource: String, // 影響的資源類型
  resourceId: String, // 資源 ID
  
  // 操作詳細
  details: {
    before: Object, // 變更前狀態
    after: Object, // 變更後狀態
    metadata: Object // 額外資訊
  },
  
  // 請求追蹤
  ipAddress: String,
  userAgent: String,
  sessionId: String,
  
  // 系統欄位
  timestamp: Date,
  severity: String // 'info' | 'warning' | 'critical'
}

// 索引設定
db.audit_logs.createIndex({ userId: 1 })
db.audit_logs.createIndex({ action: 1 })
db.audit_logs.createIndex({ timestamp: 1 })
db.audit_logs.createIndex({ severity: 1 })
```

### System Settings Collection
系統全域設定管理。

```javascript
// system_settings collection
{
  _id: ObjectId,
  key: String, // 設定鍵名，唯一
  value: Mixed, // 設定值
  category: String, // 設定分類 'auth' | 'email' | 'system'
  description: String, // 設定說明
  
  // 設定約束
  constraints: {
    type: String, // 'string' | 'number' | 'boolean' | 'object'
    required: Boolean,
    default: Mixed,
    validation: String // regex 或驗證規則
  },
  
  // 系統欄位
  createdAt: Date,
  updatedAt: Date,
  updatedBy: ObjectId // 最後修改者
}

// 索引設定
db.system_settings.createIndex({ key: 1 }, { unique: true })
db.system_settings.createIndex({ category: 1 })
```

## 資料關聯設計

### 主要關聯結構
```
Users (1) ←→ (N) Accounts     # OAuth 帳號綁定
Users (1) ←→ (N) Sessions     # 登入 Sessions
Users (1) ←→ (N) Audit_Logs   # 操作審計記錄
```

### 資料一致性原則
1. **外鍵約束**：使用 MongoDB 參考完整性檢查
2. **軟刪除**：重要資料採 `deleted: true` 標記而非真實刪除
3. **樂觀鎖定**：關鍵操作使用 `version` 欄位防止並發衝突

## 資料庫效能設計

### 索引策略
1. **主要查詢**：email, role, status 建立複合索引
2. **時間序列**：createdAt, updatedAt, lastLoginAt 建立遞減索引  
3. **TTL 索引**：sessions.expires, verificationtokens.expires 自動清理

### 分片考量
- **使用者資料**：以 email hash 進行分片（未來擴充）
- **審計記錄**：以 timestamp 進行時間分片

### 備份策略
- **完整備份**：每日凌晨進行完整資料庫備份
- **增量備份**：每 6 小時進行 oplog 增量備份
- **備份驗證**：自動化備份完整性檢查

## 安全合規設計

### 敏感資料處理
```javascript
// 密碼加密
password: bcrypt.hash(plainPassword, 12)

// Token 產生
emailVerificationToken: crypto.randomBytes(32).toString('hex')

// 個資遮罩 (查詢結果)
email: "test***@example.com" // 僅顯示前 4 字元
```

### 資料保留政策
- **會員資料**：帳號刪除後 30 天完全移除
- **審計記錄**：保留 2 年後歸檔
- **Session 資料**：依 TTL 自動清理

---

**相關文件：**
- [API 設計規格](./api-specifications.md)
- [安全合規規格](./security-compliance.md)  
- [使用者角色定義](./user-roles.md)
- [認證子系統架構](../architecture/subsystems/architecture-subsystem-auth.md)