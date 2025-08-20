# 開發注意事項

## 文件資訊
- **適用專案：** 企業洞察平台會員管理系統（Brownfield）
- **文件版本：** v1.0
- **最後更新：** 2025-08-20
- **目標讀者：** 開發 Agent、技術團隊
- **輸出語言：** 繁體中文（臺灣用語）

---

## 🚨 **CRITICAL - 開發 Agent 必讀事項**

### ⚠️ **絕對禁止事項 - 違反將導致系統故障**

#### 1. **發信機制**
- **❌ 絕對不得改用新的發信工具或 env keys**
- **✅ 必須直接參考並復用 `flattened-codebase.xml` 中 `/feedback` 的發信實作**
- **✅ 使用相同的 library 與 env keys**
- **⚠️ 若需要具體程式碼片段，請要求 PM 抽出 `/feedback` 程式碼供參考**

#### 2. **既有 Admin 頁面整合**
- **❌ 絕對不得修改 `/admin/sitemap` 與 `/admin/database` 的既有邏輯**
- **✅ 必須完全參考現有頁面的 UI 設計與互動邏輯**
- **✅ 任何 UI 與行為上的細部更動需與 PM/Owner 討論**
- **✅ 使用相同的樣式類別與元件結構**

#### 3. **Root 帳號安全**
- **❌ 絕不可將 `leosys/01517124` 硬編碼於 repository**
- **✅ 必須以環境變數 `ROOT_USERNAME`, `ROOT_PASSWORD` 初始化**
- **✅ 上線時強制變更密碼機制**

#### 4. **Brownfield 約束**
- **❌ 絕不修改任何既有程式碼、API、資料庫結構**
- **❌ 絕不刪除任何既有檔案或功能**
- **✅ 僅允許新增會員管理相關的內容**
- **✅ 完整參閱：`docs/BROWNFIELD-DEVELOPMENT-CONSTRAINTS.md`**

---

## 1. 開發環境設定

### 1.1 前置要求檢查清單

```bash
# 環境檢查腳本
#!/bin/bash
echo "=== 會員管理系統開發環境檢查 ==="

# 1. Node.js 版本檢查
node_version=$(node -v)
echo "Node.js 版本: $node_version"
[[ $node_version == v21* ]] || echo "⚠️ 建議使用 Node.js 21"

# 2. Docker 環境檢查
docker --version || echo "❌ Docker 未安裝"
docker-compose --version || echo "❌ Docker Compose 未安裝"

# 3. MongoDB 連線檢查
docker-compose exec mongodb mongosh --eval "rs.status()" || echo "⚠️ MongoDB Replica Set 未正確設定"

# 4. 環境變數檢查
[[ -f .env.local ]] && echo "✅ .env.local 存在" || echo "❌ 需要建立 .env.local"

echo "=== 檢查完成 ==="
```

### 1.2 必要環境變數設定

```env
# .env.local (開發環境)
# NextAuth.js 基礎設定
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=你的_nextauth_secret_最少32字元

# Google OAuth 設定
GOOGLE_CLIENT_ID=你的_google_client_id
GOOGLE_CLIENT_SECRET=你的_google_client_secret

# MongoDB 連線 (須支援 transactions)
MONGODB_URI=mongodb://localhost:27017/corp_insight?replicaSet=rs0

# Root 帳號設定 (環境變數化)
ROOT_USERNAME=root_admin
ROOT_PASSWORD=複雜密碼_請變更

# 發信設定 (必須沿用既有設定)
# ⚠️ 請參考既有 /feedback 實作的確切 env keys
MAIL_FROM=noreply@corp-insight.com
MAIL_HOST=your_smtp_host
MAIL_PORT=587
MAIL_USER=your_smtp_user
MAIL_PASS=your_smtp_password
```

---

## 2. 技術實作指引

### 2.1 NextAuth.js 設定要點

#### 2.1.1 核心配置檔案
```typescript
// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI!);
const clientPromise = Promise.resolve(client);

export const authOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile',
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
  ],
  
  callbacks: {
    async signIn({ user, account, profile }) {
      // ⚠️ 重要：實作帳號合併邏輯
      if (account?.provider === 'google') {
        return await handleGoogleSignIn(user, account, profile);
      }
      return true;
    },
    
    async session({ session, token }) {
      // ⚠️ 重要：確保 session 包含必要資訊
      if (session.user) {
        session.user.id = token.sub;
        session.user.role = token.role || 'user';
      }
      return session;
    },
  },
  
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  
  session: {
    strategy: 'jwt',
    maxAge: 15 * 60, // 15 分鐘
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

#### 2.1.2 帳號合併邏輯實作
```typescript
async function handleGoogleSignIn(user: any, account: any, profile: any) {
  try {
    const db = await connectToDatabase();
    
    // 檢查是否已有相同 email 的用戶
    const existingUser = await db.collection('users').findOne({
      email: profile.email
    });
    
    if (existingUser) {
      // 合併 OAuth provider 到既有帳號
      await db.collection('user_auth_providers').updateOne(
        { user_id: existingUser._id, provider: 'google' },
        {
          $set: {
            provider_user_id: profile.sub,
            provider_email: profile.email,
            raw_profile: profile,
            updated_at: new Date(),
          }
        },
        { upsert: true }
      );
      
      console.log(`Google 帳號已合併到既有用戶: ${existingUser._id}`);
    } else {
      // 建立新用戶 (email_verified: true)
      const newUser = await db.collection('users').insertOne({
        email: profile.email,
        email_verified: true,
        display_name: profile.name,
        role: 'user',
        plan: 'free',
        created_at: new Date(),
        updated_at: new Date(),
      });
      
      // 建立 provider 綁定記錄
      await db.collection('user_auth_providers').insertOne({
        user_id: newUser.insertedId,
        provider: 'google',
        provider_user_id: profile.sub,
        provider_email: profile.email,
        raw_profile: profile,
        created_at: new Date(),
        updated_at: new Date(),
      });
      
      console.log(`新 Google 用戶已建立: ${newUser.insertedId}`);
    }
    
    // 記錄 audit log
    await logOAuthEvent('google_signin_success', user, account);
    
    return true;
  } catch (error) {
    console.error('Google sign-in error:', error);
    await logOAuthEvent('google_signin_error', user, account, error);
    return false;
  }
}
```

### 2.2 MongoDB 資料模型實作

#### 2.2.1 Collection Schemas
```typescript
// 用戶主資料
interface User {
  _id: ObjectId;
  email: string;           // unique index
  email_verified: boolean;
  password_hash?: string;  // 可選，OAuth 用戶可能沒有
  display_name: string;
  phone?: string;
  company?: string;
  title?: string;
  plan: 'free' | 'pro';
  role: 'user' | 'admin' | 'root';
  
  // 時間戳記
  created_at: Date;
  updated_at: Date;
  last_login_at?: Date;
  deleted_at?: Date;
  
  // 設定與偏好
  preferences: {
    language: string;
    timezone: string;
    notifications: boolean;
  };
}

// OAuth Provider 綁定
interface UserAuthProvider {
  _id: ObjectId;
  user_id: ObjectId;       // 關聯到 users collection
  provider: 'google' | 'facebook' | 'line';
  provider_user_id: string;
  provider_email?: string;
  raw_profile: object;     // Provider 回傳的完整 profile
  created_at: Date;
  updated_at: Date;
}

// Refresh Token 管理
interface RefreshToken {
  _id: ObjectId;
  user_id: ObjectId;
  token_hash: string;      // 不儲存原始 token
  revoked: boolean;
  ip_address: string;
  user_agent: string;
  created_at: Date;
  expires_at: Date;
  last_used_at?: Date;
}
```

#### 2.2.2 索引建立
```typescript
// 重要索引建立腳本
async function createIndexes() {
  const db = await connectToDatabase();
  
  // users collection 索引
  await db.collection('users').createIndex({ email: 1 }, { unique: true });
  await db.collection('users').createIndex({ role: 1 });
  await db.collection('users').createIndex({ created_at: -1 });
  await db.collection('users').createIndex({ last_login_at: -1 });
  
  // user_auth_providers 索引
  await db.collection('user_auth_providers').createIndex({ user_id: 1 });
  await db.collection('user_auth_providers').createIndex({ 
    provider: 1, 
    provider_user_id: 1 
  }, { unique: true });
  
  // refresh_tokens 索引
  await db.collection('refresh_tokens').createIndex({ token_hash: 1 }, { unique: true });
  await db.collection('refresh_tokens').createIndex({ user_id: 1 });
  await db.collection('refresh_tokens').createIndex({ expires_at: 1 }, { expireAfterSeconds: 0 });
  
  // audit_logs 索引
  await db.collection('audit_logs').createIndex({ created_at: -1 });
  await db.collection('audit_logs').createIndex({ event_type: 1 });
  await db.collection('audit_logs').createIndex({ user_id: 1 });
}
```

---

## 3. 安全實作要求

### 3.1 OAuth 安全檢查清單

```typescript
// 完整的 OAuth 安全驗證
class OAuthSecurityValidator {
  // 1. State 參數驗證 (CSRF 防護)
  static validateState(receivedState: string, sessionState: string): boolean {
    return receivedState === sessionState && sessionState.length >= 32;
  }
  
  // 2. PKCE 驗證
  static validatePKCE(codeVerifier: string, codeChallenge: string): boolean {
    const hash = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
    return hash === codeChallenge;
  }
  
  // 3. Nonce 驗證 (重放攻擊防護)
  static validateNonce(tokenNonce: string, sessionNonce: string): boolean {
    return tokenNonce === sessionNonce && sessionNonce.length >= 32;
  }
  
  // 4. ID Token 驗證
  static async validateIdToken(idToken: string): Promise<boolean> {
    try {
      // 使用 JWT 函式庫驗證 ID token
      const decoded = jwt.verify(idToken, publicKey, {
        issuer: 'https://accounts.google.com',
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      
      // 檢查過期時間
      const now = Math.floor(Date.now() / 1000);
      return decoded.exp > now;
    } catch (error) {
      console.error('ID Token validation failed:', error);
      return false;
    }
  }
}
```

### 3.2 Session 安全設定

```typescript
// 安全的 Session 設定
const sessionConfig = {
  // Cookie 安全設定
  cookies: {
    sessionToken: {
      name: 'corp-insight-session',
      options: {
        httpOnly: true,                    // 防止 XSS
        secure: process.env.NODE_ENV === 'production', // HTTPS only
        sameSite: 'strict',               // CSRF 防護
        maxAge: 15 * 60,                  // 15 分鐘
        path: '/',
      },
    },
  },
  
  // JWT 設定
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 15 * 60,                      // 15 分鐘
    encryption: true,                     // JWT 加密
  },
  
  // Session 策略
  session: {
    strategy: 'jwt',
    maxAge: 15 * 60,                      // 15 分鐘
    updateAge: 5 * 60,                    // 5 分鐘更新一次
  },
};
```

---

## 4. 發信機制整合

### 4.1 既有發信實作參考

⚠️ **重要提醒：必須沿用既有 `/feedback` 的發信實作**

```typescript
// ⚠️ 這是範例，實際實作必須參考既有 /feedback 程式碼
interface MailConfig {
  // 確切的 env keys 需參考既有實作
  host: string;     // process.env.MAIL_HOST
  port: number;     // process.env.MAIL_PORT
  secure: boolean;
  auth: {
    user: string;   // process.env.MAIL_USER
    pass: string;   // process.env.MAIL_PASS
  };
}

// 複用既有發信邏輯
async function sendVerificationEmail(email: string, token: string) {
  // ⚠️ 必須使用與 /feedback 相同的發信函式
  const existingMailSender = require('../../../feedback/mail-sender'); // 假設路徑
  
  const emailContent = {
    to: email,
    subject: '企業洞察平台 - Email 驗證',
    html: `
      <h2>請驗證您的 Email 地址</h2>
      <p>點擊以下連結完成驗證：</p>
      <a href="${process.env.NEXTAUTH_URL}/auth/verify-email?token=${token}">
        驗證 Email 地址
      </a>
      <p>此連結將在 24 小時後過期。</p>
    `,
  };
  
  return existingMailSender.send(emailContent);
}
```

### 4.2 發信模板設計

```typescript
// Email 模板統一管理
class EmailTemplates {
  static verificationEmail(verifyUrl: string) {
    return {
      subject: '企業洞察平台 - 請驗證您的 Email 地址',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Email 驗證</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #f5f5f5; padding: 20px;">
            <h2 style="color: #333;">歡迎加入企業洞察平台</h2>
            <p>感謝您註冊企業洞察平台帳號。請點擊以下按鈕驗證您的 Email 地址：</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verifyUrl}" 
                 style="background: #007bff; color: white; padding: 12px 30px; 
                        text-decoration: none; border-radius: 5px; display: inline-block;">
                驗證 Email 地址
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              如果按鈕無法點擊，請複製以下連結到瀏覽器：<br>
              <a href="${verifyUrl}">${verifyUrl}</a>
            </p>
            
            <p style="color: #666; font-size: 12px;">
              此連結將在 24 小時後過期。如果您沒有註冊此帳號，請忽略此信件。
            </p>
          </div>
        </body>
        </html>
      `,
    };
  }
  
  static passwordResetEmail(resetUrl: string) {
    return {
      subject: '企業洞察平台 - 密碼重設要求',
      html: `/* 類似的 HTML 模板 */`,
    };
  }
}
```

---

## 5. 錯誤處理與日誌記錄

### 5.1 統一錯誤處理

```typescript
// 統一的錯誤處理類別
class AuthErrorHandler {
  static handleOAuthError(error: any, provider: string) {
    const errorMap = {
      'access_denied': {
        message: '用戶取消了登入授權',
        action: 'redirect_to_signin',
        level: 'info',
      },
      'invalid_grant': {
        message: '授權碼已過期或無效',
        action: 'retry_oauth',
        level: 'warning',
      },
      'invalid_client': {
        message: 'OAuth 客戶端設定錯誤',
        action: 'contact_admin',
        level: 'error',
      },
    };
    
    const errorInfo = errorMap[error.code] || {
      message: '登入過程發生未知錯誤',
      action: 'contact_support',
      level: 'error',
    };
    
    // 記錄錯誤日誌
    this.logError(provider, error, errorInfo);
    
    return errorInfo;
  }
  
  static async logError(provider: string, error: any, errorInfo: any) {
    const db = await connectToDatabase();
    
    await db.collection('audit_logs').insertOne({
      event_type: 'oauth_error',
      provider,
      error_code: error.code,
      error_message: error.message,
      error_details: errorInfo,
      severity: errorInfo.level,
      ip_address: error.request?.ip || 'unknown',
      user_agent: error.request?.headers?.['user-agent'] || 'unknown',
      created_at: new Date(),
    });
  }
}
```

### 5.2 結構化日誌記錄

```typescript
// 結構化日誌記錄
class AuditLogger {
  static async logUserActivity(
    eventType: string,
    userId: string,
    details: object,
    request?: any
  ) {
    const db = await connectToDatabase();
    
    const logEntry = {
      event_type: eventType,
      user_id: new ObjectId(userId),
      details,
      ip_address: request?.ip || 'unknown',
      user_agent: request?.headers?.['user-agent'] || 'unknown',
      created_at: new Date(),
    };
    
    await db.collection('audit_logs').insertOne(logEntry);
  }
  
  static async logSecurityEvent(
    eventType: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    details: object,
    request?: any
  ) {
    const db = await connectToDatabase();
    
    const logEntry = {
      event_type: eventType,
      severity,
      details,
      ip_address: request?.ip || 'unknown',
      user_agent: request?.headers?.['user-agent'] || 'unknown',
      blocked: severity === 'critical',
      created_at: new Date(),
    };
    
    await db.collection('audit_logs').insertOne(logEntry);
    
    // Critical 事件立即通知
    if (severity === 'critical') {
      await this.notifySecurityTeam(logEntry);
    }
  }
}
```

---

## 6. 測試實作指引

### 6.1 單元測試範例

```typescript
// OAuth 流程測試
describe('Google OAuth Integration', () => {
  beforeEach(async () => {
    // 測試資料庫設定
    await setupTestDatabase();
  });
  
  test('應該成功建立新用戶（Google OAuth）', async () => {
    const mockProfile = {
      sub: 'google_user_123',
      email: 'test@example.com',
      email_verified: true,
      name: '測試用戶',
    };
    
    const result = await handleGoogleSignIn(
      { email: mockProfile.email },
      { provider: 'google' },
      mockProfile
    );
    
    expect(result).toBe(true);
    
    // 檢查用戶是否已建立
    const user = await db.collection('users').findOne({
      email: mockProfile.email
    });
    
    expect(user).toBeTruthy();
    expect(user.email_verified).toBe(true);
    expect(user.role).toBe('user');
  });
  
  test('應該合併到既有用戶帳號', async () => {
    // 先建立既有用戶
    const existingUser = await db.collection('users').insertOne({
      email: 'existing@example.com',
      email_verified: false,
      display_name: '既有用戶',
      role: 'user',
      created_at: new Date(),
    });
    
    const mockProfile = {
      sub: 'google_user_456',
      email: 'existing@example.com',
      email_verified: true,
      name: '既有用戶',
    };
    
    const result = await handleGoogleSignIn(
      { email: mockProfile.email },
      { provider: 'google' },
      mockProfile
    );
    
    expect(result).toBe(true);
    
    // 檢查 provider 綁定是否建立
    const provider = await db.collection('user_auth_providers').findOne({
      user_id: existingUser.insertedId,
      provider: 'google',
    });
    
    expect(provider).toBeTruthy();
    expect(provider.provider_user_id).toBe('google_user_456');
  });
});
```

### 6.2 整合測試範例

```typescript
// API 端點整合測試
describe('Authentication API', () => {
  test('POST /api/auth/verify-email 應該驗證 email token', async () => {
    // 建立測試用戶與驗證 token
    const user = await createTestUser({ email_verified: false });
    const token = generateVerificationToken(user._id);
    
    const response = await request(app)
      .get(`/api/auth/verify-email?token=${token}`)
      .expect(200);
    
    expect(response.body.success).toBe(true);
    
    // 檢查用戶 email_verified 狀態
    const updatedUser = await db.collection('users').findOne({
      _id: user._id
    });
    
    expect(updatedUser.email_verified).toBe(true);
  });
});
```

---

## 7. 效能最佳化建議

### 7.1 資料庫查詢最佳化

```typescript
// 最佳化的用戶查詢
class UserService {
  // 使用索引優化查詢
  static async findUserByEmail(email: string) {
    const db = await connectToDatabase();
    
    return db.collection('users').findOne(
      { email: email.toLowerCase() }, // 標準化 email
      { 
        projection: { 
          password_hash: 0  // 排除敏感欄位
        } 
      }
    );
  }
  
  // 批次查詢 provider 資訊
  static async getUserWithProviders(userId: string) {
    const db = await connectToDatabase();
    
    const result = await db.collection('users').aggregate([
      { $match: { _id: new ObjectId(userId) } },
      {
        $lookup: {
          from: 'user_auth_providers',
          localField: '_id',
          foreignField: 'user_id',
          as: 'auth_providers'
        }
      },
      {
        $project: {
          password_hash: 0,
          'auth_providers.raw_profile': 0  // 排除大型欄位
        }
      }
    ]).toArray();
    
    return result[0];
  }
}
```

### 7.2 快取策略

```typescript
// Redis 快取整合 (可選)
class CacheService {
  static async getUserSession(sessionId: string) {
    // 先檢查快取
    const cached = await redis.get(`session:${sessionId}`);
    if (cached) {
      return JSON.parse(cached);
    }
    
    // 快取未命中，查詢資料庫
    const session = await db.collection('sessions').findOne({
      sessionToken: sessionId
    });
    
    if (session) {
      // 快取 5 分鐘
      await redis.setex(`session:${sessionId}`, 300, JSON.stringify(session));
    }
    
    return session;
  }
}
```

---

## 8. 部署前檢查清單

### 8.1 程式碼檢查

- [ ] 所有環境變數都已設定且不含硬編碼秘密
- [ ] OAuth Client ID/Secret 已設定且有效
- [ ] MongoDB Replica Set 已正確初始化
- [ ] 發信功能使用既有 `/feedback` 實作
- [ ] 所有 API 端點都有適當的錯誤處理
- [ ] 安全檢查（CSRF, PKCE, nonce）都已實作
- [ ] 日誌記錄功能正常運作

### 8.2 功能測試

- [ ] Google OAuth 登入流程完整測試
- [ ] Email 驗證流程測試
- [ ] 帳號合併邏輯測試
- [ ] 錯誤處理流程測試
- [ ] Admin 後台功能測試
- [ ] 備份/還原功能測試

### 8.3 安全檢查

- [ ] HTTPS 強制設定（生產環境）
- [ ] Cookie 安全屬性設定
- [ ] CSRF 防護測試
- [ ] SQL/NoSQL 注入防護
- [ ] XSS 防護測試
- [ ] 敏感資料加密驗證

### 8.4 效能檢查

- [ ] 資料庫索引建立完成
- [ ] API 回應時間 < 300ms
- [ ] 並發登入測試通過
- [ ] 記憶體使用率正常
- [ ] 錯誤率 < 1%

---

**此文件為開發團隊的完整實作指引，確保會員管理系統的品質與安全性。所有開發 Agent 在實作前都必須詳細閱讀並遵循這些指引。**