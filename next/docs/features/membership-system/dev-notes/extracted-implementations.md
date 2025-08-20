# 既有系統實作參考文件

## 文件資訊
- **文件目的：** 為會員管理系統開發提供既有實作參考
- **資料來源：** flattened-codebase.xml 程式碼分析
- **提取範圍：** `/feedback` 發信邏輯 + `/admin` 管理介面
- **建立日期：** 2025-08-20
- **輸出語言：** 繁體中文（臺灣用語）

---

## 🚀 **核心發現摘要**

### **可重用的既有實作：**
1. ✅ **完整的 Email 發信機制** - 已有 nodemailer + JWT 驗證實作
2. ✅ **Admin 管理後台架構** - 完整的管理介面與 API 安全機制
3. ✅ **MongoDB 連線與環境配置** - 已建立的資料庫連線模式
4. ✅ **統一的錯誤處理模式** - API 路由的標準化錯誤處理

### **可直接整合的環境變數：**
- `MONGODB_URI` - MongoDB 連線字串（支援 Docker 與本機環境）
- `JWT_SECRET` - JWT 簽署密鑰
- `NEXT_PUBLIC_ADMIN_SECRET_TOKEN` - Admin API 安全權杖

---

## 📧 **1. Feedback 發信機制實作參考**

### **1.1 核心 API 端點**

#### **驗證碼發送 API: `/api/feedback/send-code`**
```typescript
// 檔案位置: src/app/api/feedback/send-code/route.ts
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import { logEmailVerification } from '@/lib/mongodbUtils';

// 核心發信邏輯
const transporter = nodemailer.createTransporter({
  // 實際設定需要從環境變數讀取
});

// JWT 驗證碼產生
const verificationToken = jwt.sign(
  { email, code, iat: Math.floor(Date.now() / 1000) },
  process.env.JWT_SECRET!
);
```

#### **回饋提交 API: `/api/feedback/submit`**
```typescript
// 檔案位置: src/app/api/feedback/submit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import Feedback from '@/lib/database/models/Feedback';
import connectToDatabase from '@/lib/database/connection';

// 驗證 JWT Token
interface VerificationTokenPayload {
  email: string;
  code: string;
  iat: number;
}

// 檔案上傳處理
const formData = await request.formData();
const attachments = [];
```

### **1.2 前端整合模式**

#### **跨域 API 呼叫邏輯**
```typescript
// 檔案位置: src/app/feedback/FeedbackForm.tsx
const isLocalProd = process.env.NEXT_PUBLIC_IS_LOCAL_PROD === 'true';

// 動態 API URL 判斷
const apiUrl = !isLocalProd && typeof window !== 'undefined' && 
  window.location.host.includes('aitools.leopilot.com')
  ? `${SITE_CONFIG.main.domain}/api/feedback/send-code`
  : '/api/feedback/send-code';

const response = await fetch(apiUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, type })
});
```

#### **回饋類型配置**
```typescript
// 檔案位置: src/lib/feedback/options.ts
export const feedbackTypes = [
  {
    id: 'data_correction',
    name: '資料勘誤',
    description: '回報資料錯誤或不準確的情況',
  },
  // ... 其他類型
];
```

### **1.3 資料庫模型**
```typescript
// 檔案位置: src/lib/database/models/Feedback.ts
const FeedbackSchema = new mongoose.Schema({
  email: { type: String, required: true },
  type: { type: String, required: true },
  content: { type: String, required: true },
  attachments: [{ filename: String, path: String }],
  createdAt: { type: Date, default: Date.now }
});

const Feedback: Model<IFeedback> = 
  mongoose.models.Feedback || 
  mongoose.model<IFeedback>('Feedback', FeedbackSchema);
```

### **1.4 會員系統整合建議**

#### **可直接重用的元件：**
1. **Email 驗證流程** - 驗證碼生成、發送、驗證機制
2. **JWT Token 管理** - 安全的臨時權杖機制
3. **檔案上傳處理** - FormData 與附件管理
4. **錯誤處理模式** - 統一的 API 錯誤回應格式

#### **需要調整的部分：**
1. **Email 範本** - 從回饋通知改為會員驗證
2. **資料庫 Schema** - 從 Feedback 改為 User/Registration
3. **驗證邏輯** - 從單次驗證改為會員註冊流程

---

## 🛠️ **2. Admin 管理後台實作參考**

### **2.1 Admin 路由架構**

#### **主要管理頁面**
```typescript
// Admin 路由結構
/admin/
├── layout.tsx              // 通用 Admin 佈局
├── sitemap/
│   ├── layout.tsx          // Sitemap 管理佈局  
│   └── page.tsx            // Sitemap 控制台
├── database/
│   ├── layout.tsx          // 資料庫管理佈局
│   └── page.tsx            // 資料庫控制台
└── sitemap-management/
    └── page.tsx            // Sitemap 任務執行器
```

#### **安全性設定**
```typescript
// 檔案位置: src/app/admin/layout.tsx
export const metadata: Metadata = {
  title: staticTitles.adminTemplate,
  robots: {
    index: false,      // 不被搜尋引擎索引
    follow: false,     // 不跟隨連結
  },
};
```

### **2.2 Admin API 安全機制**

#### **權杖驗證模式**
```typescript
// 檔案位置: src/app/api/admin/run-script/route.ts
const ADMIN_SECRET_TOKEN = process.env.ADMIN_SECRET_TOKEN;

// API 安全檢查
const response = await fetch('/api/admin/run-script', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.NEXT_PUBLIC_ADMIN_SECRET_TOKEN}`
  },
  body: JSON.stringify({ scriptName })
});
```

#### **腳本白名單機制**
```typescript
// 允許執行的腳本白名單
const SCRIPT_WHITELIST = [
  // Sitemap Management
  'sitemap:test', 'sitemap:monitor', 'sitemap:stop', 'sitemap:status', 'sitemap:clear',
  // Database Operations  
  'db:backup', 'db:restore', 'db:init',
  // 會員系統可新增的腳本
  'membership:setup', 'membership:migrate'
];
```

### **2.3 資料庫管理介面**

#### **資料庫狀態監控**
```typescript
// 檔案位置: src/components/admin/DatabaseConsole.tsx
import { useDatabaseStatus } from '@/hooks/useDatabaseStatus';
import DatabaseStatsDashboard from './DatabaseStatsDashboard';
import BackupStatsDashboard from './BackupStatsDashboard';
import CollectionStatusCard from './CollectionStatusCard';

// 即時資料庫狀態監控
const { collections, stats, isLoading, refresh } = useDatabaseStatus();
```

#### **API 端點範例**
```typescript
// 檔案位置: src/app/api/admin/database-stats/route.ts
async function getLatestBackupInfo() {
  const backupDir = path.join(process.cwd(), 'db', 'backups');
  // ... 備份資訊取得邏輯
}

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    // 資料庫統計資訊取得
    const stats = await db.admin().serverStatus();
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
  }
}
```

### **2.4 終端機執行器**

#### **即時命令執行介面**
```typescript
// 檔案位置: src/components/admin/TerminalViewer.tsx
import { Terminal, Copy, Check } from 'lucide-react';
import AnsiToHtml from 'ansi-to-html';

// 串流式命令輸出顯示
const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  setTerminalOutput(prev => prev + chunk);
}
```

### **2.5 會員系統整合建議**

#### **可直接重用的管理功能：**
1. **即時監控面板** - 資料庫狀態與會員統計
2. **安全 API 框架** - 權杖驗證與白名單機制
3. **終端機介面** - 會員相關腳本執行
4. **備份管理** - 會員資料備份與還原

#### **建議新增的管理功能：**
```typescript
// 會員管理相關腳本
const MEMBERSHIP_SCRIPTS = [
  'membership:user-stats',      // 會員統計
  'membership:oauth-status',    // OAuth 狀態檢查
  'membership:cleanup-tokens',  // 清理過期 Token
  'membership:export-users',    // 會員資料匯出
];
```

---

## 🔧 **3. 環境變數與配置參考**

### **3.1 既有環境變數**

#### **資料庫連線**
```bash
# MongoDB 連線設定 (支援 Docker 與本機)
MONGODB_URI=mongodb://admin:password@mongodb:27017/corp-insight?authSource=admin

# 本機開發環境
MONGODB_URI=mongodb://admin:password@localhost:27017/corp-insight?authSource=admin
```

#### **安全相關**
```bash
# JWT 簽署密鑰
JWT_SECRET=default-jwt-secret-for-dev

# Admin API 安全權杖
ADMIN_SECRET_TOKEN=your-admin-secret-token
NEXT_PUBLIC_ADMIN_SECRET_TOKEN=your-admin-secret-token
```

#### **應用程式設定**
```bash
# 環境設定
NODE_ENV=development
DOCKER_CONTAINER=true
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# 本地正式環境測試
NEXT_PUBLIC_IS_LOCAL_PROD=true
```

### **3.2 會員系統建議新增環境變數**

```bash
# OAuth 設定
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_CLIENT_ID=your-facebook-client-id
FACEBOOK_CLIENT_SECRET=your-facebook-client-secret
LINE_CHANNEL_ID=your-line-channel-id
LINE_CHANNEL_SECRET=your-line-channel-secret

# NextAuth.js 設定
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret

# Email 發信設定
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

---

## 🏗️ **4. 架構整合模式**

### **4.1 資料庫連線模式**

#### **既有連線機制**
```typescript
// 檔案位置: src/lib/database/connection.ts
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 
  'mongodb://admin:password@localhost:27017/corp-insight?authSource=admin';

export default async function connectToDatabase() {
  if (mongoose.connection.readyState >= 1) {
    return { db: mongoose.connection.db };
  }
  
  try {
    await mongoose.connect(MONGODB_URI);
    return { db: mongoose.connection.db };
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}
```

#### **會員系統資料庫整合**
```typescript
// 建議新增: src/lib/database/models/User.ts
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  emailVerified: { type: Date },
  name: String,
  image: String,
  // OAuth 提供者帳號整合
  accounts: [{
    provider: String,    // 'google', 'facebook', 'line'
    providerAccountId: String,
    type: String,        // 'oauth'
    scope: String,
    token_type: String,
    access_token: String,
    refresh_token: String,
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
```

### **4.2 API 路由模式**

#### **既有 API 錯誤處理模式**
```typescript
// 標準 API 路由結構
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    // 商業邏輯處理
    const result = await processRequest(request);
    
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: '處理請求時發生錯誤' },
      { status: 500 }
    );
  }
}
```

#### **會員系統 API 建議結構**
```typescript
// 建議新增: src/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import connectToDatabase from '@/lib/database/connection';

const handler = NextAuth({
  adapter: MongoDBAdapter(connectToDatabase()),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  // 重用既有的 JWT 設定
  secret: process.env.JWT_SECRET,
});

export { handler as GET, handler as POST };
```

### **4.3 前端整合模式**

#### **既有載入狀態管理**
```typescript
// 檔案位置: src/components/common/loading/LoadingTypes.tsx
export function SimpleSpinner() {
  return <div className="flex justify-center p-4">Loading...</div>;
}

export function InlineLoading() {
  return <div className="animate-pulse">載入中...</div>;
}
```

#### **會員系統前端整合**
```typescript
// 建議新增: src/components/auth/LoginButton.tsx
'use client';
import { signIn, signOut, useSession } from 'next-auth/react';
import { SimpleSpinner } from '@/components/common/loading/LoadingTypes';

export default function LoginButton() {
  const { data: session, status } = useSession();
  
  if (status === 'loading') return <SimpleSpinner />;
  
  if (session) {
    return (
      <button onClick={() => signOut()}>
        登出 ({session.user?.name})
      </button>
    );
  }
  
  return (
    <button onClick={() => signIn('google')}>
      使用 Google 登入
    </button>
  );
}
```

---

## 📋 **5. 關鍵檔案清單**

### **5.1 需要研讀的核心檔案**

#### **發信機制相關**
- `src/app/api/feedback/send-code/route.ts` - 驗證碼發送邏輯
- `src/app/api/feedback/submit/route.ts` - 表單提交與檔案處理
- `src/app/feedback/FeedbackForm.tsx` - 前端表單與 API 整合
- `src/lib/database/models/Feedback.ts` - 資料庫模型範例

#### **Admin 管理相關**
- `src/app/admin/layout.tsx` - Admin 頁面基礎佈局
- `src/app/api/admin/run-script/route.ts` - 安全腳本執行 API
- `src/components/admin/DatabaseConsole.tsx` - 資料庫管理介面
- `src/components/admin/TerminalViewer.tsx` - 終端機執行器

#### **核心基礎設施**
- `src/lib/database/connection.ts` - MongoDB 連線管理
- `src/config/site.ts` - 全站設定檔案
- `docker-compose.yml` - Docker 環境設定

### **5.2 可直接複製使用的程式碼片段**

#### **MongoDB 連線（完全可重用）**
```typescript
// 從 src/lib/database/connection.ts 複製
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 
  'mongodb://admin:password@localhost:27017/corp-insight?authSource=admin';

export default async function connectToDatabase() {
  if (mongoose.connection.readyState >= 1) {
    return { db: mongoose.connection.db };
  }
  
  try {
    await mongoose.connect(MONGODB_URI);
    return { db: mongoose.connection.db };
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}
```

#### **JWT 驗證邏輯（可調整重用）**
```typescript
// 從 src/app/api/feedback/send-code/route.ts 改編
import jwt from 'jsonwebtoken';

// 產生驗證碼
const code = Math.floor(100000 + Math.random() * 900000).toString();

// 產生 JWT Token
const verificationToken = jwt.sign(
  { email, code, iat: Math.floor(Date.now() / 1000) },
  process.env.JWT_SECRET!
);

// 驗證 JWT Token
const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
  email: string;
  code: string;
  iat: number;
};
```

#### **Admin API 安全檢查（可直接使用）**
```typescript
// 從 src/app/api/admin/run-script/route.ts 複製
const ADMIN_SECRET_TOKEN = process.env.ADMIN_SECRET_TOKEN;

// 檢查 Authorization header
const authHeader = request.headers.get('authorization');
if (!authHeader || !authHeader.startsWith('Bearer ')) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

const token = authHeader.substring(7);
if (token !== ADMIN_SECRET_TOKEN) {
  return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
}
```

---

## 🎯 **6. 立即可行的整合策略**

### **6.1 Phase 1: 基礎環境整合**

#### **Step 1.1: 環境變數設定**
```bash
# 複製既有環境變數配置
cp .env.example .env.local

# 新增會員系統必要變數
echo "GOOGLE_CLIENT_ID=your-google-client-id" >> .env.local
echo "GOOGLE_CLIENT_SECRET=your-google-client-secret" >> .env.local
echo "NEXTAUTH_URL=http://localhost:3000" >> .env.local
echo "NEXTAUTH_SECRET=your-nextauth-secret" >> .env.local
```

#### **Step 1.2: 依賴套件安裝**
```bash
# NextAuth.js 與相關依賴
npm install next-auth @next-auth/mongodb-adapter

# 既有的 nodemailer 和 jwt 已可重用
# npm install nodemailer jsonwebtoken  # 已安裝
```

#### **Step 1.3: 資料庫 Collection 建立**
```javascript
// 重用既有的資料庫初始化腳本
// 參考: scripts/db-init.js
db.createCollection('users');
db.createCollection('accounts');
db.createCollection('sessions');
db.createCollection('verification_tokens');
```

### **6.2 Phase 2: 發信機制整合**

#### **Step 2.1: 重用 nodemailer 設定**
```typescript
// 基於既有 feedback API 修改
// 從驗證碼發送改為會員驗證信
const mailOptions = {
  from: process.env.SMTP_USER,
  to: email,
  subject: '企業洞察平台 - 會員驗證',
  html: `
    <h2>歡迎加入企業洞察平台</h2>
    <p>您的驗證碼是：<strong>${code}</strong></p>
    <p>請在 10 分鐘內完成驗證。</p>
  `
};
```

#### **Step 2.2: JWT Token 驗證調整**
```typescript
// 重用既有 JWT 邏輯，調整 payload
const verificationToken = jwt.sign(
  { 
    email, 
    code, 
    purpose: 'email_verification',  // 新增用途識別
    iat: Math.floor(Date.now() / 1000) 
  },
  process.env.JWT_SECRET!,
  { expiresIn: '10m' }  // 新增過期時間
);
```

### **6.3 Phase 3: Admin 介面擴展**

#### **Step 3.1: 會員管理頁面**
```typescript
// 新增: src/app/admin/membership/page.tsx
// 重用既有 DatabaseConsole 架構
import MembershipConsole from '@/components/admin/MembershipConsole';

export default function MembershipPage() {
  return <MembershipConsole />;
}
```

#### **Step 3.2: 擴展腳本白名單**
```typescript
// 修改: src/app/api/admin/run-script/route.ts
const SCRIPT_WHITELIST = [
  // 既有腳本...
  'sitemap:test', 'sitemap:monitor',
  // 新增會員系統腳本
  'membership:user-stats',
  'membership:oauth-status', 
  'membership:cleanup-tokens',
];
```

---

## 🚨 **7. 重要注意事項**

### **7.1 BROWNFIELD 開發約束**

⚠️ **嚴格遵循既有架構，絕不修改現有程式碼**

#### **允許的操作：**
- ✅ 新增新的 API 路由（如 `/api/auth/*`）
- ✅ 新增新的頁面（如 `/admin/membership/*`）
- ✅ 新增新的元件和工具函式
- ✅ 擴展既有的白名單和設定檔案

#### **禁止的操作：**
- ❌ 修改既有 API 路由
- ❌ 變更既有資料庫 Schema
- ❌ 修改既有元件的邏輯
- ❌ 變更既有的環境變數名稱

### **7.2 安全考量**

#### **密鑰管理**
```bash
# 重用既有 JWT_SECRET 
# 新增專用的 NextAuth secret
NEXTAUTH_SECRET=$(openssl rand -base64 32)
```

#### **Admin 權限控制**
```typescript
// 重用既有的 ADMIN_SECRET_TOKEN 機制
// 所有會員管理 API 都需要通過權杖驗證
if (token !== ADMIN_SECRET_TOKEN) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
}
```

### **7.3 效能考量**

#### **資料庫連線重用**
```typescript
// 沿用既有的連線池機制
// 避免重複建立資料庫連線
if (mongoose.connection.readyState >= 1) {
  return { db: mongoose.connection.db };
}
```

#### **API 回應快取**
```typescript
// 沿用既有的快取策略
export async function GET() {
  // 設定 no-store 確保管理介面資料即時性
  const response = await fetch(apiUrl, { cache: 'no-store' });
}
```

---

## 📞 **8. 後續支援**

### **8.1 開發過程中的問題排查**

#### **常見整合問題：**
1. **MongoDB 連線問題** → 檢查 `MONGODB_URI` 環境變數
2. **JWT 驗證失敗** → 確認 `JWT_SECRET` 設定正確
3. **Admin API 403 錯誤** → 檢查 `ADMIN_SECRET_TOKEN` 配置
4. **Email 發送失敗** → 驗證 SMTP 設定與 nodemailer 配置

#### **除錯工具：**
- 使用既有的 `npm run health:check` 檢查系統狀態
- Admin 終端機介面執行相關診斷腳本
- MongoDB Express 管理介面（`http://localhost:8081`）

### **8.2 參考文件**

#### **既有專案文件：**
- `docs/BROWNFIELD-DEVELOPMENT-CONSTRAINTS.md` - 開發約束
- `docs/guidelines/coding-standards.md` - 編碼規範
- `docs/guidelines/environment-setup.md` - 環境設定

#### **技術參考：**
- NextAuth.js 官方文件：https://next-auth.js.org/
- MongoDB Adapter：https://next-auth.js.org/adapters/mongodb
- Nodemailer 設定：https://nodemailer.com/

---

## 🎉 **結論**

### **成功整合的關鍵要素：**

1. ✅ **重用既有基礎設施** - MongoDB 連線、JWT 機制、Admin 框架
2. ✅ **遵循既有架構模式** - API 錯誤處理、前端載入狀態、安全機制
3. ✅ **擴展而非修改** - 新增功能而不變更既有程式碼
4. ✅ **保持一致性** - 沿用既有的編碼風格與檔案結構

### **預期成果：**
- 快速啟動會員系統開發，避免重複造輪子
- 確保與既有系統的完美整合，降低相容性風險
- 利用已驗證的安全機制，提升系統可靠性
- 維持專案的整體架構一致性與可維護性

**此 dev-note 為會員管理系統開發提供了詳實的既有實作參考，確保新功能能夠順利整合到企業洞察平台的既有架構中。** 🚀

---
**文件維護者：** BMad Product Manager Agent  
**最後更新：** 2025-08-20  
**版本：** v1.0