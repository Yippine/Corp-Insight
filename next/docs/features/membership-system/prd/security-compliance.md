# 安全合規規格

本文件定義會員管理系統的安全要求與合規設計，基於現有系統架構確保最高安全標準。

## 🔒 核心安全原則

### 深度防禦策略
1. **多層安全**：認證、授權、加密、審計全面覆蓋
2. **最小權限**：使用者僅獲得必要的最小權限
3. **假設突破**：假設每一層都可能被突破，建立多重防線
4. **安全設計**：安全性從設計階段就開始考慮

### 零信任架構
- **永不信任**：不信任網路內外的任何實體
- **總是驗證**：每次存取都要驗證身分與權限
- **最小存取**：僅提供完成任務所需的最小權限

## 🛡️ 認證安全

### 密碼安全策略

#### 密碼強度要求
```typescript
// 密碼複雜度規則
const passwordRequirements = {
  minLength: 8,              // 最少 8 字元
  requireUppercase: true,    // 至少 1 個大寫字母
  requireLowercase: true,    // 至少 1 個小寫字母
  requireNumbers: true,      // 至少 1 個數字
  requireSpecial: true,      // 至少 1 個特殊字元
  maxLength: 128,           // 最多 128 字元
  
  // 禁止常見密碼
  blacklist: [
    'password', '123456', 'qwerty', 
    'admin', 'user', 'corp', 'insight'
  ]
};

// 密碼驗證函數
function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < passwordRequirements.minLength) {
    errors.push(`密碼長度至少需要 ${passwordRequirements.minLength} 字元`);
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('密碼必須包含至少一個大寫字母');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('密碼必須包含至少一個小寫字母');
  }
  
  if (!/\d/.test(password)) {
    errors.push('密碼必須包含至少一個數字');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('密碼必須包含至少一個特殊字元');
  }
  
  // 檢查是否為常見密碼
  if (passwordRequirements.blacklist.includes(password.toLowerCase())) {
    errors.push('此密碼過於常見，請選擇更安全的密碼');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
```

#### 密碼儲存安全
```typescript
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// 使用 bcrypt 進行密碼雜湊（cost factor: 12）
const BCRYPT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  // 額外的 pepper（從環境變數取得）
  const pepper = process.env.PASSWORD_PEPPER || '';
  const saltedPassword = password + pepper;
  
  return await bcrypt.hash(saltedPassword, BCRYPT_ROUNDS);
}

export async function verifyPassword(
  password: string, 
  hashedPassword: string
): Promise<boolean> {
  const pepper = process.env.PASSWORD_PEPPER || '';
  const saltedPassword = password + pepper;
  
  return await bcrypt.compare(saltedPassword, hashedPassword);
}

// 安全的隨機 Token 生成
export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}
```

### Session 安全管理

#### NextAuth.js Session 配置
```typescript
// lib/auth/config.ts - NextAuth 安全配置
export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 15 * 60,        // 15 分鐘 Access Token
    updateAge: 5 * 60,      // 5 分鐘內更新 Token
  },
  
  jwt: {
    maxAge: 15 * 60,        // JWT 過期時間 15 分鐘
    encode: async ({ token, secret }) => {
      // 自訂 JWT 編碼邏輯
      return jwt.sign(token!, secret, {
        algorithm: 'HS256',
        expiresIn: '15m'
      });
    },
    decode: async ({ token, secret }) => {
      try {
        return jwt.verify(token!, secret) as JWT;
      } catch (error) {
        return null;
      }
    }
  },
  
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,      // 防止 XSS 攻擊
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: 'lax',     // CSRF 防護
        path: '/',
        maxAge: 15 * 60,     // 15 分鐘
      }
    }
  },
  
  // 安全回調
  callbacks: {
    async signIn({ user, account, profile }) {
      // 額外的登入安全檢查
      if (user.status === 'suspended') {
        throw new Error('帳號已被停用');
      }
      
      // 記錄登入事件
      await logSecurityEvent('user_signin', {
        userId: user.id,
        provider: account?.provider,
        ip: request?.ip
      });
      
      return true;
    },
    
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role;
        token.permissions = user.permissions;
        token.lastLoginAt = new Date();
      }
      return token;
    }
  }
};
```

#### Refresh Token 機制
```typescript
// Refresh Token 安全管理
interface RefreshToken {
  userId: string;
  token: string;
  expiresAt: Date;
  isRevoked: boolean;
  deviceFingerprint: string;  // 設備指紋
  ipAddress: string;
  userAgent: string;
}

export class RefreshTokenService {
  // 生成 Refresh Token（14 天有效期）
  static async generateRefreshToken(
    userId: string,
    deviceInfo: { ip: string; userAgent: string }
  ): Promise<string> {
    const token = generateSecureToken();
    const deviceFingerprint = this.generateDeviceFingerprint(deviceInfo);
    
    const refreshToken = new RefreshToken({
      userId,
      token: await bcrypt.hash(token, 10), // 儲存 hash 而非明文
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      deviceFingerprint,
      ipAddress: deviceInfo.ip,
      userAgent: deviceInfo.userAgent
    });
    
    await refreshToken.save();
    return token; // 返回明文給前端
  }
  
  // Token 輪替機制
  static async rotateRefreshToken(
    oldToken: string,
    deviceInfo: { ip: string; userAgent: string }
  ): Promise<string> {
    // 撤銷舊 Token
    await this.revokeRefreshToken(oldToken);
    
    // 生成新 Token
    const tokenRecord = await RefreshToken.findOne({ 
      token: await bcrypt.hash(oldToken, 10) 
    });
    
    if (!tokenRecord) {
      throw new Error('Invalid refresh token');
    }
    
    return await this.generateRefreshToken(tokenRecord.userId, deviceInfo);
  }
  
  private static generateDeviceFingerprint(deviceInfo: { ip: string; userAgent: string }): string {
    return crypto
      .createHash('sha256')
      .update(`${deviceInfo.ip}:${deviceInfo.userAgent}`)
      .digest('hex');
  }
}
```

## 🔐 OAuth 安全

### PKCE (Proof Key for Code Exchange) 實作
```typescript
// OAuth PKCE 安全實作
export class PKCEService {
  static generateCodeVerifier(): string {
    return crypto.randomBytes(32).toString('base64url');
  }
  
  static generateCodeChallenge(verifier: string): string {
    return crypto
      .createHash('sha256')
      .update(verifier)
      .digest('base64url');
  }
  
  static verifyCodeChallenge(verifier: string, challenge: string): boolean {
    const computedChallenge = this.generateCodeChallenge(verifier);
    return crypto.timingSafeEqual(
      Buffer.from(computedChallenge),
      Buffer.from(challenge)
    );
  }
}

// OAuth State 參數安全管理
export class OAuthStateService {
  static generateState(): string {
    return crypto.randomBytes(16).toString('hex');
  }
  
  static async storeState(state: string, userId?: string): Promise<void> {
    const stateRecord = new OAuthState({
      state,
      userId,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 分鐘
      createdAt: new Date()
    });
    
    await stateRecord.save();
  }
  
  static async validateState(state: string): Promise<boolean> {
    const stateRecord = await OAuthState.findOne({
      state,
      expiresAt: { $gt: new Date() }
    });
    
    if (stateRecord) {
      // 使用後立即刪除（一次性使用）
      await OAuthState.deleteOne({ _id: stateRecord._id });
      return true;
    }
    
    return false;
  }
}
```

## 🛡️ 輸入驗證與清理

### 輸入驗證策略
```typescript
import validator from 'validator';
import DOMPurify from 'dompurify';

// 通用輸入驗證類別
export class InputValidator {
  // Email 驗證
  static validateEmail(email: string): { valid: boolean; sanitized: string } {
    const trimmed = email.trim().toLowerCase();
    
    return {
      valid: validator.isEmail(trimmed) && trimmed.length <= 254,
      sanitized: trimmed
    };
  }
  
  // 名稱驗證
  static validateName(name: string): { valid: boolean; sanitized: string } {
    const sanitized = DOMPurify.sanitize(name.trim());
    
    return {
      valid: sanitized.length >= 1 && 
             sanitized.length <= 100 && 
             /^[\u4e00-\u9fff\w\s\-\.]+$/u.test(sanitized), // 支援中文
      sanitized
    };
  }
  
  // 防止 NoSQL 注入
  static sanitizeMongoQuery(query: any): any {
    if (typeof query !== 'object' || query === null) {
      return query;
    }
    
    const sanitized = {};
    for (const [key, value] of Object.entries(query)) {
      // 移除危險的操作符
      if (key.startsWith('$')) {
        continue;
      }
      
      if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeMongoQuery(value);
      } else if (typeof value === 'string') {
        sanitized[key] = DOMPurify.sanitize(value);
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }
}
```

### XSS 防護
```typescript
// XSS 防護中介軟體
export function xssProtectionMiddleware(
  req: NextRequest,
  res: NextResponse,
  next: NextFunction
) {
  // 設定安全標頭
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://accounts.google.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "connect-src 'self' https://api.corp-insight.com",
    "frame-src https://accounts.google.com"
  ].join('; '));
  
  return next();
}
```

## 🔥 CSRF 防護

### NextAuth.js CSRF 整合
```typescript
// CSRF Token 驗證
export async function validateCSRFToken(req: NextRequest): Promise<boolean> {
  const token = req.headers.get('x-csrf-token') || 
                req.cookies.get('next-auth.csrf-token')?.value;
  
  if (!token) {
    return false;
  }
  
  // 使用 NextAuth.js 內建的 CSRF 驗證
  const csrfData = await getCsrfToken({ req });
  return crypto.timingSafeEqual(
    Buffer.from(token),
    Buffer.from(csrfData.csrfToken)
  );
}

// API 路由 CSRF 保護
export function withCSRFProtection(handler: Function) {
  return async (req: NextRequest, res: NextResponse) => {
    if (['POST', 'PUT', 'DELETE'].includes(req.method!)) {
      const isValidCSRF = await validateCSRFToken(req);
      if (!isValidCSRF) {
        return NextResponse.json(
          { error: 'CSRF token validation failed' },
          { status: 403 }
        );
      }
    }
    
    return handler(req, res);
  };
}
```

## 🚦 速率限制

### 基於記憶體的速率限制
```typescript
import { LRUCache } from 'lru-cache';

// 速率限制配置
const rateLimitConfig = {
  // 認證相關端點（更嚴格）
  auth: {
    windowMs: 15 * 60 * 1000,  // 15 分鐘
    max: 5,                    // 最多 5 次嘗試
    message: '登入嘗試次數過多，請稍後再試'
  },
  
  // 一般 API 端點
  api: {
    windowMs: 1 * 60 * 1000,   // 1 分鐘
    max: 100,                  // 最多 100 個請求
    message: '請求頻率過高，請稍後再試'
  },
  
  // 管理員端點
  admin: {
    windowMs: 1 * 60 * 1000,   // 1 分鐘
    max: 200,                  // 最多 200 個請求
    message: '管理員請求頻率過高'
  }
};

// 速率限制實作
export class RateLimiter {
  private cache = new LRUCache<string, number[]>({
    max: 10000,
    ttl: 15 * 60 * 1000 // 15 分鐘 TTL
  });
  
  async isAllowed(
    identifier: string,
    config: { windowMs: number; max: number }
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const now = Date.now();
    const windowStart = now - config.windowMs;
    
    // 取得現有記錄
    const requests = this.cache.get(identifier) || [];
    
    // 清除過期記錄
    const validRequests = requests.filter(time => time > windowStart);
    
    // 檢查是否超過限制
    if (validRequests.length >= config.max) {
      const resetTime = Math.min(...validRequests) + config.windowMs;
      return {
        allowed: false,
        remaining: 0,
        resetTime
      };
    }
    
    // 記錄新請求
    validRequests.push(now);
    this.cache.set(identifier, validRequests);
    
    return {
      allowed: true,
      remaining: config.max - validRequests.length,
      resetTime: now + config.windowMs
    };
  }
}

// 速率限制中介軟體
export function createRateLimitMiddleware(configKey: keyof typeof rateLimitConfig) {
  const limiter = new RateLimiter();
  const config = rateLimitConfig[configKey];
  
  return async (req: NextRequest) => {
    // 使用 IP + User Agent 作為識別符
    const identifier = `${req.ip}-${req.headers.get('user-agent')}`;
    
    const result = await limiter.isAllowed(identifier, config);
    
    if (!result.allowed) {
      return NextResponse.json(
        { 
          error: 'RATE_LIMIT_EXCEEDED',
          message: config.message,
          resetTime: result.resetTime
        },
        { status: 429 }
      );
    }
    
    // 在回應中加入速率限制資訊
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', config.max.toString());
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
    response.headers.set('X-RateLimit-Reset', result.resetTime.toString());
    
    return response;
  };
}
```

## 📊 安全監控與審計

### 安全事件記錄
```typescript
// 安全事件類型定義
interface SecurityEvent {
  eventType: 'login_success' | 'login_failure' | 'password_change' | 
             'account_locked' | 'suspicious_activity' | 'admin_action';
  userId?: string;
  ipAddress: string;
  userAgent: string;
  details: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
}

// 安全事件記錄器
export class SecurityLogger {
  static async logEvent(event: Omit<SecurityEvent, 'timestamp'>): Promise<void> {
    const securityLog = new SecurityLog({
      ...event,
      timestamp: new Date()
    });
    
    await securityLog.save();
    
    // 高嚴重性事件即時通知
    if (event.severity === 'critical') {
      await this.sendSecurityAlert(event);
    }
  }
  
  // 檢測可疑活動
  static async detectSuspiciousActivity(
    userId: string,
    ipAddress: string
  ): Promise<boolean> {
    const recentActivity = await SecurityLog.find({
      userId,
      timestamp: { $gte: new Date(Date.now() - 60 * 60 * 1000) } // 1小時內
    });
    
    // 檢測異常登入地點
    const uniqueIPs = new Set(recentActivity.map(log => log.ipAddress));
    if (uniqueIPs.size > 3) {
      await this.logEvent({
        eventType: 'suspicious_activity',
        userId,
        ipAddress,
        userAgent: '',
        details: { reason: 'multiple_ip_addresses', count: uniqueIPs.size },
        severity: 'high'
      });
      return true;
    }
    
    // 檢測頻繁操作
    const authAttempts = recentActivity.filter(log => 
      log.eventType === 'login_failure'
    );
    
    if (authAttempts.length > 10) {
      await this.logEvent({
        eventType: 'suspicious_activity',
        userId,
        ipAddress,
        userAgent: '',
        details: { reason: 'excessive_login_attempts', count: authAttempts.length },
        severity: 'high'
      });
      return true;
    }
    
    return false;
  }
  
  private static async sendSecurityAlert(event: SecurityEvent): Promise<void> {
    // 整合現有的 email 發送機制
    const transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_SERVER_HOST,
      port: parseInt(process.env.EMAIL_SERVER_PORT || '465', 10),
      secure: process.env.EMAIL_SERVER_PORT === '465',
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      }
    });
    
    await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME} Security" <${process.env.EMAIL_FROM}>`,
      to: process.env.SECURITY_ALERT_EMAIL,
      subject: `🚨 Critical Security Event - ${event.eventType}`,
      html: `
        <h2>安全事件警報</h2>
        <p><strong>事件類型：</strong> ${event.eventType}</p>
        <p><strong>嚴重性：</strong> ${event.severity}</p>
        <p><strong>使用者：</strong> ${event.userId || 'N/A'}</p>
        <p><strong>IP 地址：</strong> ${event.ipAddress}</p>
        <p><strong>時間：</strong> ${event.timestamp}</p>
        <pre>${JSON.stringify(event.details, null, 2)}</pre>
      `
    });
  }
}
```

## 🔐 資料保護

### 敏感資料遮罩
```typescript
// 敏感資料遮罩工具
export class DataMasking {
  // Email 遮罩
  static maskEmail(email: string): string {
    const [localPart, domain] = email.split('@');
    if (localPart.length <= 3) {
      return `${localPart.charAt(0)}***@${domain}`;
    }
    return `${localPart.substring(0, 3)}***@${domain}`;
  }
  
  // 電話號碼遮罩
  static maskPhone(phone: string): string {
    if (phone.length <= 4) return '****';
    return `****${phone.slice(-4)}`;
  }
  
  // 使用者資料遮罩（用於日誌）
  static maskUserData(user: any): any {
    return {
      ...user,
      email: user.email ? this.maskEmail(user.email) : undefined,
      phone: user.phone ? this.maskPhone(user.phone) : undefined,
      password: '[REDACTED]',
      passwordResetToken: '[REDACTED]',
      emailVerificationToken: '[REDACTED]'
    };
  }
}
```

### 資料加密
```typescript
import crypto from 'crypto';

// AES-256-GCM 加密工具
export class EncryptionService {
  private static algorithm = 'aes-256-gcm';
  private static key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');
  
  static encrypt(text: string): { encrypted: string; iv: string; tag: string } {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.algorithm, this.key);
    cipher.setAAD(Buffer.from('corp-insight-auth'));
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    };
  }
  
  static decrypt(encryptedData: { encrypted: string; iv: string; tag: string }): string {
    const decipher = crypto.createDecipherGCM(this.algorithm, this.key);
    decipher.setAAD(Buffer.from('corp-insight-auth'));
    decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}
```

## 📋 合規性要求

### GDPR 合規
```typescript
// GDPR 合規工具
export class GDPRCompliance {
  // 使用者資料匯出
  static async exportUserData(userId: string): Promise<any> {
    const user = await User.findById(userId);
    const sessions = await Session.find({ userId });
    const auditLogs = await SecurityLog.find({ userId });
    
    return {
      personalData: {
        email: user.email,
        name: user.name,
        profile: user.profile,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt
      },
      sessionData: sessions.map(session => ({
        createdAt: session.createdAt,
        ipAddress: DataMasking.maskIP(session.ipAddress),
        userAgent: session.userAgent
      })),
      activityLogs: auditLogs.map(log => ({
        eventType: log.eventType,
        timestamp: log.timestamp,
        ipAddress: DataMasking.maskIP(log.ipAddress)
      }))
    };
  }
  
  // 使用者資料刪除
  static async deleteUserData(userId: string): Promise<void> {
    // 軟刪除使用者資料
    await User.findByIdAndUpdate(userId, {
      $set: {
        email: `deleted_${userId}@deleted.local`,
        name: '[DELETED]',
        profile: {},
        status: 'deleted',
        deletedAt: new Date()
      },
      $unset: {
        password: 1,
        emailVerificationToken: 1,
        passwordResetToken: 1
      }
    });
    
    // 刪除相關的 sessions
    await Session.deleteMany({ userId });
    
    // 保留審計日誌但遮罩個人資料
    await SecurityLog.updateMany(
      { userId },
      { $set: { userId: `[DELETED_${userId}]` } }
    );
  }
}
```

## 🚨 安全檢核清單

### 部署前安全檢查
- [ ] **認證安全**
  - [ ] 密碼強度驗證實作
  - [ ] bcrypt cost factor ≥ 12
  - [ ] Session timeout 設定正確
  - [ ] Refresh token 輪替機制

- [ ] **OAuth 安全**
  - [ ] PKCE 實作完整
  - [ ] State 參數驗證
  - [ ] Nonce 防重放攻擊
  - [ ] SSL/TLS 強制使用

- [ ] **輸入驗證**
  - [ ] 所有使用者輸入都經過驗證
  - [ ] NoSQL 注入防護
  - [ ] XSS 防護實作
  - [ ] CSRF 防護啟用

- [ ] **速率限制**
  - [ ] 認證端點速率限制
  - [ ] API 端點速率限制
  - [ ] 管理員端點保護

- [ ] **監控與審計**
  - [ ] 安全事件記錄
  - [ ] 可疑活動偵測
  - [ ] 高嚴重性事件警報
  - [ ] 審計記錄保留政策

- [ ] **資料保護**
  - [ ] 敏感資料加密
  - [ ] 個人資料遮罩
  - [ ] GDPR 合規功能
  - [ ] 資料保留政策

- [ ] **基礎設施安全**
  - [ ] HTTPS 強制啟用
  - [ ] 安全標頭設定
  - [ ] Cookie 安全屬性
  - [ ] 環境變數保護

---

**相關文件：**
- [API 設計規格](./api-specifications.md)
- [資料模型規格](./data-models.md)
- [開發優先順序](./development-priorities.md)
- [使用者角色定義](./user-roles.md)