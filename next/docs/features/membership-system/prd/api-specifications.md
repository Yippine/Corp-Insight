# API 設計規格

## 🚨 **BROWNFIELD 開發約束** 🚨

**⚠️ 此 API 設計必須遵循全專案 Brownfield 約束：**
**[../../../BROWNFIELD-DEVELOPMENT-CONSTRAINTS.md](../../../BROWNFIELD-DEVELOPMENT-CONSTRAINTS.md)**

---

本文件定義會員管理系統的 API 設計規格，**完全遵循 Brownfield 開發原則**，基於現有 Next.js App Router 與 MongoDB 架構模式。

## 🏗️ 架構設計原則

### 遵循既有模式

- **Next.js App Router**：`src/app/api/*/route.ts` 結構
- **錯誤處理**：標準 NextResponse.json 格式
- **資料庫連線**：使用現有 `connectToDatabase` 模式
- **Mongoose 模型**：遵循現有 models 結構與命名
- **環境變數**：沿用現有 email 發送配置
- **權限驗證**：採用現有 `ADMIN_SECRET_TOKEN` 模式

### TypeScript 介面一致性

```typescript
// 成功回應格式（沿用現有模式）
{
  success: true,
  message?: string,
  data?: any
}

// 錯誤回應格式（沿用現有模式）
{
  success?: false,
  error: string,
  details?: string,
  message?: string
}
```

## 🔐 NextAuth.js 核心端點

### 標準認證路徑

NextAuth.js 自動生成的標準端點，無需自訂實作：

```typescript
// 所有 NextAuth.js 標準端點
/api/ahtu /
  signin / // GET - 顯示登入頁面
  api /
  auth /
  signout / // POST - 登出處理
  api /
  auth /
  callback /
  [provider] / // GET - OAuth 回調處理
  api /
  auth /
  csrf / // GET - 取得 CSRF token
  api /
  auth /
  session / // GET - 取得當前 session
  api /
  auth /
  providers / // GET - 取得 providers 列表
  // Google OAuth 特定端點
  api /
  auth /
  signin /
  google / // GET - 發起 Google 登入
  api /
  auth /
  callback /
  google / // GET - Google 回調處理
  // Credentials 登入端點
  api /
  auth /
  callback /
  credentials; // POST - 帳密登入處理
```

### Session 回應格式

```typescript
// GET /api/auth/session 成功回應
{
  "user": {
    "id": "64f5a1b2c3d4e5f6a7b8c9d0",
    "email": "user@example.com",
    "name": "John Doe",
    "image": "https://lh3.googleusercontent.com/...",
    "role": "user"
  },
  "expires": "2025-09-18T10:00:00.000Z"
}

// 未登入時回應
{
  "user": null
}
```

## 📧 會員註冊與驗證 API

### Email 註冊

```typescript
// POST /api/auth/register/route.ts
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const { email, password, name, acceptTerms } = await request.json();

    // 驗證必要欄位
    if (!email || !password || !name || !acceptTerms) {
      return NextResponse.json(
        { error: '缺少必要欄位', success: false },
        { status: 400 }
      );
    }

    // 檢查 email 是否已存在
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'EMAIL_ALREADY_EXISTS', message: '此 Email 已被註冊' },
        { status: 409 }
      );
    }

    // 建立新使用者（未驗證狀態）
    const hashedPassword = await bcrypt.hash(password, 12);
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');

    const newUser = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      status: 'pending_verification',
      role: 'user',
      emailVerificationToken,
      emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24小時
    });

    await newUser.save();

    // 使用現有 email 發送機制（沿用 feedback 模式）
    const transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_SERVER_HOST,
      port: parseInt(process.env.EMAIL_SERVER_PORT || '465', 10),
      secure: process.env.EMAIL_SERVER_PORT === '465',
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${emailVerificationToken}`;

    await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'Corp Insight'}" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Corp Insight 帳號驗證',
      html: `請點擊以下連結驗證您的帳號：<a href="${verificationUrl}">驗證帳號</a>`,
    });

    return NextResponse.json(
      {
        success: true,
        message: '註冊成功，請檢查信箱完成驗證',
        userId: newUser._id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Email 註冊錯誤：', error);
    return NextResponse.json(
      {
        success: false,
        error: '註冊失敗',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
```

### Email 驗證

```typescript
// POST /api/auth/verify-email/route.ts
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: '驗證 Token 為必填', success: false },
        { status: 400 }
      );
    }

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'TOKEN_INVALID_OR_EXPIRED', message: '驗證連結無效或已過期' },
        { status: 400 }
      );
    }

    // 更新使用者狀態
    await User.findByIdAndUpdate(user._id, {
      $set: {
        emailVerified: new Date(),
        status: 'active',
        emailVerificationToken: undefined,
        emailVerificationExpires: undefined,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Email 驗證成功，帳號已啟用',
    });
  } catch (error) {
    console.error('Email 驗證錯誤：', error);
    return NextResponse.json(
      { error: '驗證失敗', success: false },
      { status: 500 }
    );
  }
}
```

### 忘記密碼

```typescript
// POST /api/auth/forgot-password/route.ts
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email 為必填', success: false },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // 安全考量：不透露使用者是否存在
      return NextResponse.json({
        success: true,
        message: '如果該 Email 已註冊，密碼重置信已發送',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    await User.findByIdAndUpdate(user._id, {
      $set: {
        passwordResetToken: resetToken,
        passwordResetExpires: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1小時
      },
    });

    // 使用現有 email 發送機制
    const transporter = nodemailer.createTransporter(/* 沿用現有配置 */);
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;

    await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'Corp Insight'}" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Corp Insight 密碼重置',
      html: `請點擊以下連結重置您的密碼：<a href="${resetUrl}">重置密碼</a>`,
    });

    return NextResponse.json({
      success: true,
      message: '如果該 Email 已註冊，密碼重置信已發送',
    });
  } catch (error) {
    console.error('忘記密碼錯誤：', error);
    return NextResponse.json(
      { error: '處理失敗', success: false },
      { status: 500 }
    );
  }
}
```

## 👤 使用者資料管理 API

### 個人資料管理

```typescript
// GET/PUT /api/user/profile/route.ts
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth'; // NextAuth 配置

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '未登入或 Session 無效', success: false },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const user = await User.findById(session.user.id).select(
      '-password -emailVerificationToken -passwordResetToken'
    );

    if (!user) {
      return NextResponse.json(
        { error: '使用者不存在', success: false },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('取得個人資料錯誤：', error);
    return NextResponse.json(
      { error: '取得資料失敗', success: false },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '未登入或 Session 無效', success: false },
        { status: 401 }
      );
    }

    const updates = await request.json();

    // 過濾允許更新的欄位
    const allowedUpdates = ['name', 'profile', 'preferences'];
    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {} as any);

    await connectToDatabase();
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { $set: filteredUpdates },
      { new: true }
    ).select('-password -emailVerificationToken -passwordResetToken');

    return NextResponse.json({
      success: true,
      message: '個人資料更新成功',
      data: updatedUser,
    });
  } catch (error) {
    console.error('更新個人資料錯誤：', error);
    return NextResponse.json(
      { error: '更新失敗', success: false },
      { status: 500 }
    );
  }
}
```

## 🛡️ 管理後台 API

### 會員管理（沿用現有權限模式）

```typescript
// GET /api/admin/users/route.ts
const ADMIN_SECRET_TOKEN = process.env.ADMIN_SECRET_TOKEN;

export async function GET(request: NextRequest) {
  // 沿用現有的 admin 權限驗證模式
  const authToken = request.headers.get('Authorization')?.split(' ')[1];
  if (!ADMIN_SECRET_TOKEN || authToken !== ADMIN_SECRET_TOKEN) {
    return NextResponse.json(
      { error: 'Unauthorized', success: false },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const status = searchParams.get('status') || '';

    await connectToDatabase();

    // 建構查詢條件
    const query: any = {};
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
      ];
    }
    if (role) query.role = role;
    if (status) query.status = status;

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password -emailVerificationToken -passwordResetToken')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('取得會員列表錯誤：', error);
    return NextResponse.json(
      { error: '取得會員列表失敗', success: false },
      { status: 500 }
    );
  }
}
```

### 統計儀表板

```typescript
// GET /api/admin/dashboard/stats/route.ts
export async function GET(request: NextRequest) {
  const authToken = request.headers.get('Authorization')?.split(' ')[1];
  if (!ADMIN_SECRET_TOKEN || authToken !== ADMIN_SECRET_TOKEN) {
    return NextResponse.json(
      { error: 'Unauthorized', success: false },
      { status: 401 }
    );
  }

  try {
    await connectToDatabase();

    const [totalUsers, activeUsers, newUsersToday, newUsersThisWeek] =
      await Promise.all([
        User.countDocuments({}),
        User.countDocuments({ status: 'active' }),
        User.countDocuments({
          createdAt: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        }),
        User.countDocuments({
          createdAt: {
            $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        }),
      ]);

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        newUsersToday,
        newUsersThisWeek,
        registrationSuccessRate: ((activeUsers / totalUsers) * 100).toFixed(1),
      },
    });
  } catch (error) {
    console.error('取得統計資料錯誤：', error);
    return NextResponse.json(
      { error: '取得統計資料失敗', success: false },
      { status: 500 }
    );
  }
}
```

## 🚨 錯誤處理標準

### 統一錯誤格式（沿用現有模式）

```typescript
// 成功回應格式
{
  success: true,
  message?: "操作成功",
  data?: any
}

// 錯誤回應格式
{
  success?: false,        // 可選，部分現有 API 無此欄位
  error: "ERROR_CODE",    // 錯誤代碼
  message?: "使用者友善訊息",
  details?: "詳細錯誤資訊"  // 開發環境使用
}
```

### HTTP 狀態碼使用

- **200 OK** - 成功操作
- **201 Created** - 成功建立資源
- **400 Bad Request** - 請求參數錯誤
- **401 Unauthorized** - 未登入或權限不足
- **404 Not Found** - 資源不存在
- **409 Conflict** - 資源衝突（如 email 重複）
- **500 Internal Server Error** - 伺服器錯誤

## 🔧 Email 發送整合

### 沿用現有 Email 配置

```typescript
// 使用與 feedback 系統相同的 email 配置
const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || '465', 10),
  secure: process.env.EMAIL_SERVER_PORT === '465',
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
  // 開發環境設定（沿用現有模式）
  ...(process.env.NODE_ENV === 'development' && {
    tls: {
      rejectUnauthorized: false,
    },
  }),
});

// 使用現有的 FROM 配置
const mailOptions = {
  from: `"${process.env.EMAIL_FROM_NAME || 'Corp Insight'}" <${process.env.EMAIL_FROM}>`,
  // ... 其他配置
};
```

## 🗄️ 資料庫模型整合

### 沿用 Mongoose 模式

```typescript
// src/lib/database/models/User.ts
import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IUser extends Document {
  email: string;
  emailVerified?: Date;
  name: string;
  image?: string;
  role: 'root' | 'admin' | 'user';
  status: 'active' | 'suspended' | 'pending_verification';
  // ... 其他欄位
}

const UserSchema: Schema<IUser> = new Schema(
  {
    // ... schema 定義
  },
  {
    timestamps: true,
    collection: 'users',
  }
);

// 索引設定（沿用現有模式）
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ role: 1 });
UserSchema.index({ status: 1 });

// 檢查模型重複編譯（沿用現有模式）
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
```

## 🎯 API 端點總覽

### NextAuth.js 標準端點（自動生成）

- `/api/auth/*` - 所有 NextAuth.js 標準端點

### 自訂會員功能端點

```
POST /api/auth/register          - Email 註冊
POST /api/auth/verify-email      - Email 驗證
POST /api/auth/forgot-password   - 忘記密碼
POST /api/auth/reset-password    - 重置密碼
POST /api/auth/change-password   - 變更密碼

GET  /api/user/profile          - 取得個人資料
PUT  /api/user/profile          - 更新個人資料
GET  /api/user/linked-accounts  - 取得綁定帳號
DELETE /api/user/linked-accounts/[provider] - 解除綁定

GET  /api/admin/users           - 會員列表管理
GET  /api/admin/users/[id]      - 會員詳細資料
PUT  /api/admin/users/[id]/status - 更新會員狀態
GET  /api/admin/dashboard/stats - 統計儀表板
```

---

**技術約束遵循確認：**
✅ 使用既有 Next.js App Router 模式
✅ 沿用現有 MongoDB + Mongoose 架構
✅ 採用現有 email 發送配置
✅ 遵循現有錯誤處理格式
✅ 使用現有權限驗證模式

**相關文件：**

- [資料模型規格](./data-models.md)
- [技術限制與前提](./technical-constraints.md)
- [第三方登入需求](./oauth-requirements.md)
