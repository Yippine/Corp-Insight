# 會員系統實作指南

## 🎯 快速開始

### 立即執行指令
```bash
cd /projects/Corp-Insight/next

# 1. 安裝 Payload CMS
npm install payload @payloadcms/db-mongodb @payloadcms/bundler-webpack @payloadcms/richtext-slate

# 2. 安裝 NextAuth.js
npm install next-auth @next-auth/mongodb-adapter

# 3. 安裝 OAuth 相關套件
npm install @auth/line-provider
```

## 📁 檔案結構

```
/projects/Corp-Insight/next/
├── payload.config.ts              # Payload CMS 配置
├── pages/api/auth/[...nextauth].ts # NextAuth.js 配置
├── middleware.ts                   # 權限中間件
├── lib/
│   ├── payload.ts                 # Payload 客戶端
│   └── auth.ts                    # 認證工具函數
├── app/
│   ├── admin/                     # Payload Admin UI
│   ├── dashboard/                 # 會員專區
│   └── auth/                      # 登入頁面
└── types/
    └── auth.ts                    # 認證相關類型定義
```

## 🔧 詳細配置步驟

### 1. Payload CMS 配置

```typescript
// payload.config.ts
import { buildConfig } from 'payload/config'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { webpackBundler } from '@payloadcms/bundler-webpack'
import { slateEditor } from '@payloadcms/richtext-slate'

export default buildConfig({
  admin: {
    bundler: webpackBundler(),
    user: 'users',
  },
  editor: slateEditor(),
  db: mongooseAdapter({
    url: process.env.DATABASE_URI!,
  }),
  collections: [
    {
      slug: 'users',
      auth: {
        tokenExpiration: 7200, // 2 hours
      },
      admin: {
        useAsTitle: 'email',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'role',
          type: 'select',
          options: [
            { label: 'Admin', value: 'admin' },
            { label: 'Member', value: 'member' },
            { label: 'Guest', value: 'guest' },
          ],
          defaultValue: 'member',
          access: {
            update: ({ req }) => req.user?.role === 'admin',
          },
        },
        {
          name: 'memberLevel',
          type: 'select',
          options: [
            { label: 'Free', value: 'free' },
            { label: 'Premium', value: 'premium' },
            { label: 'Enterprise', value: 'enterprise' },
          ],
          defaultValue: 'free',
        },
        {
          name: 'provider',
          type: 'select',
          options: [
            { label: 'Google', value: 'google' },
            { label: 'Facebook', value: 'facebook' },
            { label: 'LINE', value: 'line' },
            { label: 'Email', value: 'email' },
          ],
        },
        {
          name: 'providerId',
          type: 'text',
        },
        {
          name: 'preferences',
          type: 'json',
          defaultValue: {},
        },
        {
          name: 'usageHistory',
          type: 'array',
          fields: [
            {
              name: 'feature',
              type: 'text',
            },
            {
              name: 'timestamp',
              type: 'date',
            },
            {
              name: 'metadata',
              type: 'json',
            },
          ],
        },
        {
          name: 'subscriptionStatus',
          type: 'select',
          options: [
            { label: 'Active', value: 'active' },
            { label: 'Inactive', value: 'inactive' },
            { label: 'Pending', value: 'pending' },
            { label: 'Cancelled', value: 'cancelled' },
          ],
          defaultValue: 'inactive',
        },
        {
          name: 'lastLoginAt',
          type: 'date',
        },
      ],
    },
  ],
  typescript: {
    outputFile: './types/payload-types.ts',
  },
})
```

### 2. NextAuth.js 配置

```typescript
// pages/api/auth/[...nextauth].ts
import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import FacebookProvider from 'next-auth/providers/facebook'
import LineProvider from '@auth/line-provider'
import { MongoDBAdapter } from '@next-auth/mongodb-adapter'
import { MongoClient } from 'mongodb'
import payload from 'payload'

const client = new MongoClient(process.env.MONGODB_URI!)
const clientPromise = client.connect()

export default NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
    LineProvider({
      clientId: process.env.LINE_CLIENT_ID!,
      clientSecret: process.env.LINE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // 檢查用戶是否已存在於 Payload
        const existingUser = await payload.find({
          collection: 'users',
          where: {
            email: {
              equals: user.email,
            },
          },
        })

        if (existingUser.docs.length === 0) {
          // 創建新用戶到 Payload
          await payload.create({
            collection: 'users',
            data: {
              email: user.email!,
              name: user.name || '',
              provider: account?.provider || 'unknown',
              providerId: account?.providerAccountId || '',
              role: 'member',
              memberLevel: 'free',
              lastLoginAt: new Date(),
            },
          })
        } else {
          // 更新最後登入時間
          await payload.update({
            collection: 'users',
            id: existingUser.docs[0].id,
            data: {
              lastLoginAt: new Date(),
            },
          })
        }

        return true
      } catch (error) {
        console.error('SignIn error:', error)
        return false
      }
    },

    async session({ session, token }) {
      if (session.user?.email) {
        // 從 Payload 獲取用戶詳細資料
        const payloadUser = await payload.find({
          collection: 'users',
          where: {
            email: {
              equals: session.user.email,
            },
          },
        })

        if (payloadUser.docs.length > 0) {
          const user = payloadUser.docs[0]
          session.user.role = user.role
          session.user.memberLevel = user.memberLevel
          session.user.id = user.id
        }
      }

      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
})
```

### 3. 權限中間件

```typescript
// middleware.ts
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauthToken

    // Admin 頁面權限檢查
    if (pathname.startsWith('/admin') && token?.role !== 'admin') {
      return NextResponse.redirect(new URL('/auth/signin', req.url))
    }

    // Premium 功能權限檢查
    if (pathname.startsWith('/premium') && token?.memberLevel === 'free') {
      return NextResponse.redirect(new URL('/upgrade', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // 公開頁面
        if (
          pathname.startsWith('/api/auth') ||
          pathname.startsWith('/_next') ||
          pathname === '/' ||
          pathname.startsWith('/public')
        ) {
          return true
        }

        // 需要登入的頁面
        return !!token
      },
    },
  }
)

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/premium/:path*', '/profile/:path*']
}
```

### 4. Payload 客戶端設定

```typescript
// lib/payload.ts
import payload from 'payload'

if (!global.payload) {
  global.payload = payload
}

export default global.payload
```

### 5. 認證工具函數

```typescript
// lib/auth.ts
import { getServerSession } from 'next-auth'
import { authOptions } from '../pages/api/auth/[...nextauth]'
import type { Session } from 'next-auth'

export async function getSession(): Promise<Session | null> {
  return await getServerSession(authOptions)
}

export async function requireAuth(): Promise<Session> {
  const session = await getSession()
  
  if (!session) {
    throw new Error('Authentication required')
  }
  
  return session
}

export async function requireRole(role: string): Promise<Session> {
  const session = await requireAuth()
  
  if (session.user.role !== role) {
    throw new Error('Insufficient permissions')
  }
  
  return session
}

export function hasPermission(
  userRole: string,
  userLevel: string,
  requiredRole?: string,
  requiredLevel?: string
): boolean {
  const roleHierarchy = ['guest', 'member', 'admin']
  const levelHierarchy = ['free', 'premium', 'enterprise']
  
  const userRoleIndex = roleHierarchy.indexOf(userRole)
  const requiredRoleIndex = requiredRole ? roleHierarchy.indexOf(requiredRole) : 0
  
  const userLevelIndex = levelHierarchy.indexOf(userLevel)
  const requiredLevelIndex = requiredLevel ? levelHierarchy.indexOf(requiredLevel) : 0
  
  return userRoleIndex >= requiredRoleIndex && userLevelIndex >= requiredLevelIndex
}
```

### 6. 類型定義

```typescript
// types/auth.ts
import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: 'admin' | 'member' | 'guest'
      memberLevel: 'free' | 'premium' | 'enterprise'
    } & DefaultSession['user']
  }

  interface User {
    role: 'admin' | 'member' | 'guest'
    memberLevel: 'free' | 'premium' | 'enterprise'
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: 'admin' | 'member' | 'guest'
    memberLevel: 'free' | 'premium' | 'enterprise'
  }
}

export interface UsageRecord {
  feature: string
  timestamp: Date
  metadata: Record<string, any>
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto'
  language: string
  notifications: {
    email: boolean
    push: boolean
    marketing: boolean
  }
  privacy: {
    showProfile: boolean
    showActivity: boolean
  }
}
```

## 🔐 環境變數配置

```bash
# .env.local
# 資料庫
DATABASE_URI=mongodb://localhost:27017/corp-insight

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Facebook OAuth  
FACEBOOK_CLIENT_ID=your-facebook-client-id
FACEBOOK_CLIENT_SECRET=your-facebook-client-secret

# LINE OAuth
LINE_CLIENT_ID=your-line-client-id
LINE_CLIENT_SECRET=your-line-client-secret

# Payload CMS
PAYLOAD_SECRET=your-payload-secret-key
```

## 📦 Docker 配置更新

```yaml
# docker-compose.dev.yml
services:
  app-dev:
    environment:
      - DATABASE_URI=mongodb://mongo:27017/corp-insight
      - NEXTAUTH_URL=http://localhost:3000
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
      - FACEBOOK_CLIENT_ID=${FACEBOOK_CLIENT_ID}
      - FACEBOOK_CLIENT_SECRET=${FACEBOOK_CLIENT_SECRET}
      - LINE_CLIENT_ID=${LINE_CLIENT_ID}
      - LINE_CLIENT_SECRET=${LINE_CLIENT_SECRET}
      - PAYLOAD_SECRET=${PAYLOAD_SECRET}
```

## 🧪 測試配置

```typescript
// tests/auth.test.ts
import { hasPermission } from '../lib/auth'

describe('Authentication Utils', () => {
  test('hasPermission should work correctly', () => {
    expect(hasPermission('admin', 'premium', 'member', 'free')).toBe(true)
    expect(hasPermission('guest', 'free', 'admin', 'premium')).toBe(false)
  })
})
```

## 🚀 部署注意事項

### 1. 生產環境設定
- 確保所有環境變數都正確設定
- 使用 HTTPS（NextAuth 要求）
- 設定正確的 NEXTAUTH_URL

### 2. MongoDB 索引優化
```javascript
// 在 MongoDB 中創建必要索引
db.users.createIndex({ email: 1 }, { unique: true })
db.accounts.createIndex({ provider: 1, providerAccountId: 1 }, { unique: true })
db.sessions.createIndex({ sessionToken: 1 }, { unique: true })
```

### 3. 監控與日誌
- 設定用戶登入/登出日誌
- 監控認證失敗次數
- 追蹤會員功能使用情況

---

**下一步**：執行上述配置後，你將擁有一個完整的會員系統，包含第三方登入、用戶管理後台和權限控制功能！