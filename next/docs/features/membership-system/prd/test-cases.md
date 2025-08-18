# 測試案例規格

## 🚨 **BROWNFIELD 開發約束** 🚨

**⚠️ 此測試案例設計必須遵循全專案 Brownfield 約束：**
**[../../../BROWNFIELD-DEVELOPMENT-CONSTRAINTS.md](../../../BROWNFIELD-DEVELOPMENT-CONSTRAINTS.md)**

---

本文件定義會員管理系統的完整測試案例規格，涵蓋功能測試、整合測試、安全測試與效能測試，確保系統品質與既有功能的完整性。

## 🎯 測試策略概述

### 測試原則
1. **既有功能保護**：每次會員系統變更都要測試既有功能正常運作
2. **分層測試**：單元測試、整合測試、端到端測試完整覆蓋
3. **安全優先**：重點測試認證、授權、資料保護功能
4. **效能監控**：確保新功能不影響系統整體效能

### 測試環境要求
- **開發環境**：本地 Docker 環境，包含完整的既有功能
- **測試環境**：模擬生產環境，含既有資料與功能
- **CI/CD 整合**：自動化測試流程，確保每次變更的安全性

## 🧪 功能測試案例

### 1. 使用者註冊測試

#### 1.1 Email/密碼註冊
```typescript
describe('Email/密碼註冊功能', () => {
  
  test('TC001: 有效資料註冊成功', async () => {
    // 測試資料
    const userData = {
      email: 'test@example.com',
      password: 'Password123!',
      name: '測試使用者',
      acceptTerms: true,
      acceptPrivacy: true
    };
    
    // 執行測試
    const response = await registerUser(userData);
    
    // 驗證結果
    expect(response.status).toBe(201);
    expect(response.data.success).toBe(true);
    expect(response.data.message).toContain('註冊成功');
    
    // 驗證資料庫狀態
    const user = await User.findOne({ email: userData.email });
    expect(user).toBeTruthy();
    expect(user.status).toBe('pending_verification');
    expect(user.emailVerified).toBeNull();
    
    // 驗證 Email 發送
    expect(mockEmailService.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: userData.email,
        subject: expect.stringContaining('驗證')
      })
    );
  });

  test('TC002: Email 重複註冊失敗', async () => {
    // 預先建立使用者
    await createTestUser({ email: 'existing@example.com' });
    
    const userData = {
      email: 'existing@example.com',
      password: 'Password123!',
      name: '重複使用者',
      acceptTerms: true
    };
    
    const response = await registerUser(userData);
    
    expect(response.status).toBe(409);
    expect(response.data.error).toBe('EMAIL_ALREADY_EXISTS');
  });

  test('TC003: 密碼強度不足註冊失敗', async () => {
    const weakPasswords = [
      '123456',           // 太短
      'password',         // 無大寫、數字、特殊字元
      'Password',         // 無數字、特殊字元
      'Password123'       // 無特殊字元
    ];
    
    for (const password of weakPasswords) {
      const userData = {
        email: `test${Date.now()}@example.com`,
        password,
        name: '測試使用者',
        acceptTerms: true
      };
      
      const response = await registerUser(userData);
      expect(response.status).toBe(400);
      expect(response.data.error).toContain('密碼');
    }
  });

  test('TC004: 必填欄位缺失註冊失敗', async () => {
    const incompleteData = [
      { password: 'Password123!', name: '測試' }, // 缺 email
      { email: 'test@example.com', name: '測試' }, // 缺 password
      { email: 'test@example.com', password: 'Password123!' }, // 缺 name
      { email: 'test@example.com', password: 'Password123!', name: '測試' } // 缺 acceptTerms
    ];
    
    for (const data of incompleteData) {
      const response = await registerUser(data);
      expect(response.status).toBe(400);
      expect(response.data.error).toContain('必要欄位');
    }
  });
});
```

#### 1.2 Email 驗證測試
```typescript
describe('Email 驗證功能', () => {
  
  test('TC005: 有效 Token 驗證成功', async () => {
    const user = await createTestUser({ 
      status: 'pending_verification',
      emailVerificationToken: 'valid-token-123',
      emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });
    
    const response = await verifyEmail({ token: 'valid-token-123' });
    
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    
    const updatedUser = await User.findById(user._id);
    expect(updatedUser.status).toBe('active');
    expect(updatedUser.emailVerified).toBeTruthy();
    expect(updatedUser.emailVerificationToken).toBeUndefined();
  });

  test('TC006: 過期 Token 驗證失敗', async () => {
    await createTestUser({ 
      emailVerificationToken: 'expired-token',
      emailVerificationExpires: new Date(Date.now() - 1000) // 過期
    });
    
    const response = await verifyEmail({ token: 'expired-token' });
    
    expect(response.status).toBe(400);
    expect(response.data.error).toBe('TOKEN_INVALID_OR_EXPIRED');
  });

  test('TC007: 無效 Token 驗證失敗', async () => {
    const response = await verifyEmail({ token: 'invalid-token' });
    
    expect(response.status).toBe(400);
    expect(response.data.error).toBe('TOKEN_INVALID_OR_EXPIRED');
  });
});
```

### 2. 使用者登入測試

#### 2.1 密碼登入測試
```typescript
describe('密碼登入功能', () => {
  
  test('TC008: 有效帳密登入成功', async () => {
    const user = await createTestUser({
      email: 'login@example.com',
      password: await bcrypt.hash('Password123!', 12),
      status: 'active',
      emailVerified: new Date()
    });
    
    const response = await loginUser({
      email: 'login@example.com',
      password: 'Password123!'
    });
    
    expect(response.status).toBe(200);
    expect(response.data.user).toMatchObject({
      email: 'login@example.com',
      id: user._id.toString()
    });
    
    // 驗證 session 建立
    expect(response.data.expires).toBeTruthy();
    
    // 驗證登入記錄
    const loginLog = await SecurityLog.findOne({
      userId: user._id,
      eventType: 'login_success'
    });
    expect(loginLog).toBeTruthy();
  });

  test('TC009: 錯誤密碼登入失敗', async () => {
    await createTestUser({
      email: 'login@example.com',
      password: await bcrypt.hash('Password123!', 12),
      status: 'active'
    });
    
    const response = await loginUser({
      email: 'login@example.com',
      password: 'WrongPassword!'
    });
    
    expect(response.status).toBe(401);
    expect(response.data.error).toContain('帳號密碼錯誤');
  });

  test('TC010: 未驗證帳號登入失敗', async () => {
    await createTestUser({
      email: 'unverified@example.com',
      password: await bcrypt.hash('Password123!', 12),
      status: 'pending_verification'
    });
    
    const response = await loginUser({
      email: 'unverified@example.com',
      password: 'Password123!'
    });
    
    expect(response.status).toBe(401);
    expect(response.data.error).toContain('未驗證');
  });

  test('TC011: 停用帳號登入失敗', async () => {
    await createTestUser({
      email: 'suspended@example.com',
      password: await bcrypt.hash('Password123!', 12),
      status: 'suspended'
    });
    
    const response = await loginUser({
      email: 'suspended@example.com',
      password: 'Password123!'
    });
    
    expect(response.status).toBe(401);
    expect(response.data.error).toContain('停用');
  });
});
```

#### 2.2 OAuth 登入測試
```typescript
describe('OAuth 登入功能', () => {
  
  test('TC012: Google OAuth 新用戶註冊登入', async () => {
    const googleProfile = {
      id: 'google-123',
      email: 'google@example.com',
      name: 'Google User',
      email_verified: true,
      picture: 'https://lh3.googleusercontent.com/photo.jpg'
    };
    
    mockGoogleAuth.mockResolvedValue(googleProfile);
    
    const response = await handleOAuthCallback('google', 'auth-code');
    
    expect(response.status).toBe(200);
    
    // 驗證使用者建立
    const user = await User.findOne({ email: 'google@example.com' });
    expect(user).toBeTruthy();
    expect(user.status).toBe('active');
    expect(user.emailVerified).toBeTruthy();
    
    // 驗證 Account 連結
    const account = await Account.findOne({ 
      userId: user._id,
      provider: 'google'
    });
    expect(account).toBeTruthy();
  });

  test('TC013: Google OAuth 既有用戶登入', async () => {
    const existingUser = await createTestUser({
      email: 'existing@example.com',
      status: 'active'
    });
    
    await Account.create({
      userId: existingUser._id,
      provider: 'google',
      providerAccountId: 'google-456'
    });
    
    const googleProfile = {
      id: 'google-456',
      email: 'existing@example.com',
      name: 'Existing User',
      email_verified: true
    };
    
    mockGoogleAuth.mockResolvedValue(googleProfile);
    
    const response = await handleOAuthCallback('google', 'auth-code');
    
    expect(response.status).toBe(200);
    expect(response.data.user.email).toBe('existing@example.com');
    
    // 驗證不會建立重複使用者
    const userCount = await User.countDocuments({ 
      email: 'existing@example.com' 
    });
    expect(userCount).toBe(1);
  });

  test('TC014: Line OAuth 缺少 Email 處理', async () => {
    const lineProfile = {
      id: 'line-789',
      name: 'Line User',
      // 缺少 email
    };
    
    mockLineAuth.mockResolvedValue(lineProfile);
    
    const response = await handleOAuthCallback('line', 'auth-code');
    
    expect(response.status).toBe(302); // 重導向至補完頁面
    expect(response.headers.location).toContain('/auth/complete-registration');
    
    // 驗證暫存註冊記錄
    const pendingReg = await PendingRegistration.findOne({
      provider: 'line'
    });
    expect(pendingReg).toBeTruthy();
  });
});
```

### 3. 密碼管理測試

#### 3.1 忘記密碼測試
```typescript
describe('忘記密碼功能', () => {
  
  test('TC015: 有效 Email 重置請求', async () => {
    const user = await createTestUser({
      email: 'reset@example.com',
      status: 'active'
    });
    
    const response = await requestPasswordReset({
      email: 'reset@example.com'
    });
    
    expect(response.status).toBe(200);
    expect(response.data.message).toContain('重置信已發送');
    
    // 驗證重置 Token 建立
    const updatedUser = await User.findById(user._id);
    expect(updatedUser.passwordResetToken).toBeTruthy();
    expect(updatedUser.passwordResetExpires).toBeInstanceOf(Date);
    
    // 驗證 Email 發送
    expect(mockEmailService.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'reset@example.com',
        subject: expect.stringContaining('重置')
      })
    );
  });

  test('TC016: 不存在 Email 安全回應', async () => {
    const response = await requestPasswordReset({
      email: 'nonexistent@example.com'
    });
    
    // 安全考量：不透露帳號存在性
    expect(response.status).toBe(200);
    expect(response.data.message).toContain('重置信已發送');
    
    // 驗證未發送 Email
    expect(mockEmailService.sendMail).not.toHaveBeenCalled();
  });

  test('TC017: 有效 Token 密碼重置', async () => {
    const resetToken = 'valid-reset-token';
    const user = await createTestUser({
      passwordResetToken: resetToken,
      passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000)
    });
    
    const response = await resetPassword({
      token: resetToken,
      password: 'NewPassword123!',
      confirmPassword: 'NewPassword123!'
    });
    
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    
    // 驗證密碼更新
    const updatedUser = await User.findById(user._id);
    const passwordValid = await bcrypt.compare(
      'NewPassword123!', 
      updatedUser.password
    );
    expect(passwordValid).toBe(true);
    
    // 驗證 Token 清除
    expect(updatedUser.passwordResetToken).toBeUndefined();
  });

  test('TC018: 過期 Token 重置失敗', async () => {
    const expiredToken = 'expired-reset-token';
    await createTestUser({
      passwordResetToken: expiredToken,
      passwordResetExpires: new Date(Date.now() - 1000)
    });
    
    const response = await resetPassword({
      token: expiredToken,
      password: 'NewPassword123!',
      confirmPassword: 'NewPassword123!'
    });
    
    expect(response.status).toBe(400);
    expect(response.data.error).toContain('過期');
  });
});
```

### 4. 個人資料管理測試

#### 4.1 資料更新測試
```typescript
describe('個人資料管理', () => {
  
  test('TC019: 有效資料更新成功', async () => {
    const user = await createTestUser({
      email: 'profile@example.com',
      name: '舊名稱'
    });
    const session = await createTestSession(user);
    
    const updateData = {
      name: '新名稱',
      profile: {
        firstName: '新',
        lastName: '名稱',
        phone: '+886912345678',
        company: '測試公司'
      },
      preferences: {
        language: 'en',
        emailNotifications: false
      }
    };
    
    const response = await updateProfile(updateData, session);
    
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    
    // 驗證資料更新
    const updatedUser = await User.findById(user._id);
    expect(updatedUser.name).toBe('新名稱');
    expect(updatedUser.profile.company).toBe('測試公司');
    expect(updatedUser.preferences.language).toBe('en');
  });

  test('TC020: 無權限更新失敗', async () => {
    const updateData = { name: '駭客名稱' };
    
    const response = await updateProfile(updateData); // 無 session
    
    expect(response.status).toBe(401);
    expect(response.data.error).toContain('未登入');
  });

  test('TC021: 禁止欄位更新被忽略', async () => {
    const user = await createTestUser();
    const session = await createTestSession(user);
    
    const maliciousData = {
      name: '正常名稱',
      role: 'admin',              // 禁止修改
      password: 'hacker123',      // 禁止修改
      email: 'hacker@evil.com',   // 禁止修改
      _id: 'fake-id'              // 禁止修改
    };
    
    const response = await updateProfile(maliciousData, session);
    
    expect(response.status).toBe(200);
    
    // 驗證禁止欄位未被修改
    const updatedUser = await User.findById(user._id);
    expect(updatedUser.role).toBe(user.role); // 未變更
    expect(updatedUser.email).toBe(user.email); // 未變更
    expect(updatedUser.name).toBe('正常名稱'); // 允許變更
  });
});
```

## 🔒 安全測試案例

### 1. 認證安全測試

#### 1.1 暴力破解防護
```typescript
describe('暴力破解防護', () => {
  
  test('TC022: 連續失敗登入鎖定', async () => {
    const user = await createTestUser({
      email: 'brute@example.com',
      password: await bcrypt.hash('Password123!', 12),
      status: 'active'
    });
    
    // 連續 5 次錯誤登入
    for (let i = 0; i < 5; i++) {
      const response = await loginUser({
        email: 'brute@example.com',
        password: 'WrongPassword!'
      });
      expect(response.status).toBe(401);
    }
    
    // 第 6 次應該被鎖定
    const response = await loginUser({
      email: 'brute@example.com',
      password: 'Password123!' // 正確密碼也被鎖定
    });
    
    expect(response.status).toBe(429);
    expect(response.data.error).toContain('鎖定');
    
    // 驗證安全事件記錄
    const securityLog = await SecurityLog.findOne({
      userId: user._id,
      eventType: 'suspicious_activity'
    });
    expect(securityLog).toBeTruthy();
  });

  test('TC023: 速率限制保護', async () => {
    const requests = [];
    
    // 在短時間內發送大量註冊請求
    for (let i = 0; i < 10; i++) {
      requests.push(
        registerUser({
          email: `spam${i}@example.com`,
          password: 'Password123!',
          name: '垃圾使用者',
          acceptTerms: true
        })
      );
    }
    
    const responses = await Promise.all(requests);
    
    // 部分請求應該被速率限制
    const rateLimitedCount = responses.filter(
      r => r.status === 429
    ).length;
    
    expect(rateLimitedCount).toBeGreaterThan(0);
  });
});
```

#### 1.2 Session 安全測試
```typescript
describe('Session 安全', () => {
  
  test('TC024: Session 過期處理', async () => {
    const user = await createTestUser({ status: 'active' });
    const expiredSession = await createTestSession(user, {
      expires: new Date(Date.now() - 1000) // 過期
    });
    
    const response = await getUserProfile(expiredSession);
    
    expect(response.status).toBe(401);
    expect(response.data.error).toContain('過期');
  });

  test('TC025: Session 劫持防護', async () => {
    const user = await createTestUser({ status: 'active' });
    const session = await createTestSession(user);
    
    // 模擬不同 IP 使用相同 session
    const response1 = await getUserProfile(session, { 
      ip: '192.168.1.100' 
    });
    const response2 = await getUserProfile(session, { 
      ip: '10.0.0.1' 
    });
    
    expect(response1.status).toBe(200);
    // 第二個請求應該觸發安全警報
    expect(response2.status).toBe(401);
    
    // 驗證安全事件記錄
    const securityLog = await SecurityLog.findOne({
      eventType: 'suspicious_activity',
      details: { reason: 'session_hijacking_suspected' }
    });
    expect(securityLog).toBeTruthy();
  });
});
```

### 2. 輸入驗證安全測試

#### 2.1 SQL/NoSQL 注入防護
```typescript
describe('注入攻擊防護', () => {
  
  test('TC026: NoSQL 注入防護', async () => {
    const maliciousInputs = [
      { $ne: null },
      { $gt: '' },
      '"; DROP TABLE users; --',
      "' OR '1'='1",
      { $where: 'this.password == this.password' }
    ];
    
    for (const maliciousInput of maliciousInputs) {
      const response = await loginUser({
        email: maliciousInput,
        password: maliciousInput
      });
      
      // 應該被安全地拒絕，不應該造成系統錯誤
      expect([400, 401]).toContain(response.status);
      expect(response.data.error).toBeDefined();
    }
    
    // 驗證資料庫完整性
    const userCount = await User.countDocuments();
    expect(userCount).toBe(0); // 沒有異常資料被建立
  });

  test('TC027: XSS 防護', async () => {
    const xssPayloads = [
      '<script>alert("XSS")</script>',
      '<img src="x" onerror="alert(1)">',
      'javascript:alert("XSS")',
      '<svg onload="alert(1)">'
    ];
    
    for (const payload of xssPayloads) {
      const user = await createTestUser();
      const session = await createTestSession(user);
      
      const response = await updateProfile({
        name: payload
      }, session);
      
      expect(response.status).toBe(200);
      
      // 驗證資料被清理
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.name).not.toContain('<script>');
      expect(updatedUser.name).not.toContain('javascript:');
    }
  });
});
```

#### 2.2 CSRF 防護測試
```typescript
describe('CSRF 防護', () => {
  
  test('TC028: 缺少 CSRF Token 拒絕', async () => {
    const user = await createTestUser({ status: 'active' });
    const session = await createTestSession(user);
    
    const response = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': session.cookie
        // 故意不包含 CSRF token
      },
      body: JSON.stringify({ name: '更新名稱' })
    });
    
    expect(response.status).toBe(403);
    
    const data = await response.json();
    expect(data.error).toContain('CSRF');
  });

  test('TC029: 無效 CSRF Token 拒絕', async () => {
    const user = await createTestUser({ status: 'active' });
    const session = await createTestSession(user);
    
    const response = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': session.cookie,
        'X-CSRF-Token': 'invalid-token'
      },
      body: JSON.stringify({ name: '更新名稱' })
    });
    
    expect(response.status).toBe(403);
  });
});
```

## 🔧 整合測試案例

### 1. 系統整合測試

#### 1.1 與既有功能整合
```typescript
describe('與既有系統整合', () => {
  
  test('TC030: 會員系統不影響既有 API', async () => {
    // 測試既有的重要 API 端點
    const existingEndpoints = [
      '/api/health',
      '/api/aitool',
      '/api/feedback/submit',
      '/api/company/twincn',
      '/api/admin/database-stats'
    ];
    
    // 部署會員系統後，測試既有端點
    for (const endpoint of existingEndpoints) {
      const response = await testExistingEndpoint(endpoint);
      
      // 既有功能應該正常運作
      expect([200, 201]).toContain(response.status);
    }
  });

  test('TC031: 資料庫整合測試', async () => {
    // 確保新的 users collection 不影響既有 collections
    const existingCollections = [
      'companies',
      'aitools',
      'feedbacks',
      'apikeystatus'
    ];
    
    // 建立會員資料
    const user = await createTestUser();
    
    // 驗證既有 collections 正常運作
    for (const collection of existingCollections) {
      const count = await mongoose.connection.db
        .collection(collection)
        .countDocuments();
      
      // 既有資料應該存在且可存取
      expect(count).toBeGreaterThanOrEqual(0);
    }
    
    // 驗證新的 users collection 正常
    const userCount = await User.countDocuments();
    expect(userCount).toBeGreaterThan(0);
  });

  test('TC032: Email 系統整合', async () => {
    // 確保會員 email 與既有 feedback email 共用配置
    const originalConfig = {
      host: process.env.EMAIL_SERVER_HOST,
      port: process.env.EMAIL_SERVER_PORT,
      user: process.env.EMAIL_SERVER_USER
    };
    
    // 發送會員驗證信
    const user = await createTestUser({
      status: 'pending_verification'
    });
    
    await sendVerificationEmail(user.email, user.emailVerificationToken);
    
    // 驗證使用相同的 email 配置
    expect(mockEmailTransporter.options.host).toBe(originalConfig.host);
    expect(mockEmailTransporter.options.port).toBe(
      parseInt(originalConfig.port || '465', 10)
    );
    expect(mockEmailTransporter.options.auth.user).toBe(originalConfig.user);
  });
});
```

#### 1.2 Admin 後台整合測試
```typescript
describe('Admin 後台整合', () => {
  
  test('TC033: Admin 權限驗證整合', async () => {
    // 使用既有的 ADMIN_SECRET_TOKEN 機制
    const validToken = process.env.ADMIN_SECRET_TOKEN;
    const invalidToken = 'invalid-token';
    
    // 測試有效 token
    const validResponse = await fetch('/api/admin/users', {
      headers: { 'Authorization': `Bearer ${validToken}` }
    });
    expect(validResponse.status).toBe(200);
    
    // 測試無效 token
    const invalidResponse = await fetch('/api/admin/users', {
      headers: { 'Authorization': `Bearer ${invalidToken}` }
    });
    expect(invalidResponse.status).toBe(401);
  });

  test('TC034: Admin 介面導航整合', async () => {
    // 驗證新的會員管理選單不影響既有導航
    const adminPages = [
      '/admin/sitemap',    // 既有
      '/admin/database',   // 既有
      '/admin/users'       // 新增
    ];
    
    for (const page of adminPages) {
      const response = await fetch(page, {
        headers: { 'Authorization': `Bearer ${process.env.ADMIN_SECRET_TOKEN}` }
      });
      
      expect([200, 302]).toContain(response.status);
    }
  });
});
```

## ⚡ 效能測試案例

### 1. 負載測試

#### 1.1 並發登入測試
```typescript
describe('效能與負載測試', () => {
  
  test('TC035: 並發登入負載測試', async () => {
    // 建立測試使用者
    const users = await Promise.all(
      Array(100).fill(0).map((_, i) => 
        createTestUser({
          email: `load${i}@example.com`,
          password: await bcrypt.hash('Password123!', 12),
          status: 'active'
        })
      )
    );
    
    // 並發登入測試
    const startTime = Date.now();
    const loginPromises = users.map(user =>
      loginUser({
        email: user.email,
        password: 'Password123!'
      })
    );
    
    const responses = await Promise.all(loginPromises);
    const endTime = Date.now();
    
    // 驗證成功率
    const successCount = responses.filter(r => r.status === 200).length;
    expect(successCount).toBeGreaterThan(90); // 90% 以上成功率
    
    // 驗證回應時間
    const avgResponseTime = (endTime - startTime) / 100;
    expect(avgResponseTime).toBeLessThan(300); // 平均 < 300ms
  });

  test('TC036: 大量會員查詢效能', async () => {
    // 建立大量測試資料
    await createBulkTestUsers(1000);
    
    const startTime = Date.now();
    
    // 執行複雜查詢
    const response = await fetch('/api/admin/users?page=1&limit=50&search=test', {
      headers: { 'Authorization': `Bearer ${process.env.ADMIN_SECRET_TOKEN}` }
    });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    expect(response.status).toBe(200);
    expect(responseTime).toBeLessThan(1000); // < 1秒
    
    const data = await response.json();
    expect(data.data).toHaveLength(50); // 正確分頁
  });
});
```

### 2. 記憶體與資源測試

#### 2.1 記憶體洩漏測試
```typescript
describe('資源管理測試', () => {
  
  test('TC037: Session 記憶體洩漏檢測', async () => {
    const initialMemory = process.memoryUsage().heapUsed;
    
    // 建立大量 sessions
    const sessions = [];
    for (let i = 0; i < 1000; i++) {
      const user = await createTestUser();
      const session = await createTestSession(user);
      sessions.push(session);
    }
    
    // 清理 sessions
    for (const session of sessions) {
      await Session.deleteOne({ sessionToken: session.sessionToken });
    }
    
    // 強制垃圾回收
    if (global.gc) {
      global.gc();
    }
    
    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = finalMemory - initialMemory;
    
    // 記憶體增長應該在合理範圍內
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // < 50MB
  });
});
```

## 🎯 端到端測試案例

### 1. 使用者旅程測試

#### 1.1 完整註冊到登入流程
```typescript
describe('端到端使用者旅程', () => {
  
  test('TC038: 完整註冊驗證登入流程', async () => {
    const testEmail = 'e2e@example.com';
    
    // 1. 註冊
    const registerResponse = await registerUser({
      email: testEmail,
      password: 'Password123!',
      name: 'E2E 測試使用者',
      acceptTerms: true
    });
    expect(registerResponse.status).toBe(201);
    
    // 2. 取得驗證 token（模擬從 email 取得）
    const user = await User.findOne({ email: testEmail });
    const verificationToken = user.emailVerificationToken;
    
    // 3. 驗證 email
    const verifyResponse = await verifyEmail({ token: verificationToken });
    expect(verifyResponse.status).toBe(200);
    
    // 4. 登入
    const loginResponse = await loginUser({
      email: testEmail,
      password: 'Password123!'
    });
    expect(loginResponse.status).toBe(200);
    
    // 5. 取得個人資料
    const session = loginResponse.data;
    const profileResponse = await getUserProfile(session);
    expect(profileResponse.status).toBe(200);
    expect(profileResponse.data.data.email).toBe(testEmail);
    
    // 6. 更新個人資料
    const updateResponse = await updateProfile({
      name: '更新後的名稱'
    }, session);
    expect(updateResponse.status).toBe(200);
    
    // 7. 登出
    const logoutResponse = await logoutUser(session);
    expect(logoutResponse.status).toBe(200);
  });

  test('TC039: 管理員管理會員流程', async () => {
    // 1. 建立測試會員
    const user = await createTestUser({
      email: 'managed@example.com',
      status: 'active'
    });
    
    const adminToken = process.env.ADMIN_SECRET_TOKEN;
    
    // 2. 查看會員列表
    const listResponse = await fetch('/api/admin/users', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    expect(listResponse.status).toBe(200);
    
    // 3. 查看會員詳細資料
    const detailResponse = await fetch(`/api/admin/users/${user._id}`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    expect(detailResponse.status).toBe(200);
    
    // 4. 停用會員
    const suspendResponse = await fetch(`/api/admin/users/${user._id}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: 'suspended',
        reason: '測試停用'
      })
    });
    expect(suspendResponse.status).toBe(200);
    
    // 5. 驗證會員無法登入
    const loginResponse = await loginUser({
      email: 'managed@example.com',
      password: 'Password123!'
    });
    expect(loginResponse.status).toBe(401);
  });
});
```

## 📊 測試覆蓋率要求

### 覆蓋率目標
- **程式碼覆蓋率**：≥ 85%
- **分支覆蓋率**：≥ 80%
- **函數覆蓋率**：≥ 90%
- **行覆蓋率**：≥ 85%

### 關鍵測試區域
1. **認證流程**：100% 覆蓋率
2. **權限檢查**：100% 覆蓋率
3. **資料驗證**：95% 覆蓋率
4. **安全功能**：100% 覆蓋率
5. **API 端點**：90% 覆蓋率

### 測試報告要求
```typescript
// Jest 配置
module.exports = {
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 90,
      lines: 85,
      statements: 85
    },
    './src/app/api/auth/': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    }
  }
};
```

## 🚀 測試執行策略

### 測試環境設定
```bash
# 測試前置作業
npm run db:test:setup      # 設定測試資料庫
npm run test:seed          # 載入測試資料
npm run test:integration   # 整合測試
npm run test:e2e          # 端到端測試
npm run test:security     # 安全測試
npm run test:performance  # 效能測試
```

### CI/CD 整合
```yaml
# GitHub Actions 測試流程
name: Membership System Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mongodb:
        image: mongo:7
        ports:
          - 27017:27017
    
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: '21'
    
    - run: npm ci
    - run: npm run test:unit
    - run: npm run test:integration
    - run: npm run test:security
    
    # 確保既有功能正常
    - run: npm run test:existing-features
    
    - name: Coverage Report
      uses: codecov/codecov-action@v3
```

---

**相關文件：**
- [API 設計規格](./api-specifications.md)
- [安全合規規格](./security-compliance.md)
- [資料模型規格](./data-models.md)
- [開發優先順序](./development-priorities.md)