# Business Magnifier - Next.js 版本

企業資訊查詢平台的現代化重構版本，採用 Next.js 14 + MongoDB 本地開發架構。

## 🚀 技術棧

- **框架**: Next.js 14.1.0 + React 18.2.0
- **語言**: TypeScript 5.8.2
- **樣式**: Tailwind CSS 3.4.1
- **資料庫**: MongoDB (本地) + Mongoose ODM
- **容器化**: Docker + Docker Compose
- **動畫**: Framer Motion 11.18.2
- **AI 整合**: Google Generative AI
- **部署**: Netlify

## 📦 安裝與設定

### 1. 安裝依賴套件

```bash
npm install
```

### 2. 環境變數設定

建立 `.env.local` 檔案：

```env
# MongoDB 本地資料庫連線
MONGODB_URI=mongodb://localhost:27017/business-magnifier

# 如果使用 Docker MongoDB
# MONGODB_URI=mongodb://admin:password@localhost:27017/business-magnifier?authSource=admin

# Google AI API
GOOGLE_AI_API_KEY=your_google_ai_api_key_here

# Google Maps API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# JWT 密鑰
JWT_SECRET=your_jwt_secret_key_here

# 郵件服務 (可選)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Next.js 環境
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# 外部 API
NEXT_PUBLIC_G0V_COMPANY_API=https://company.g0v.ronny.tw/api
NEXT_PUBLIC_G0V_TENDER_API=https://pcc.g0v.ronny.tw/api
```

### 3. MongoDB 設定

#### 方式一：本地安裝 MongoDB

1. 下載並安裝 [MongoDB Community Server](https://www.mongodb.com/try/download/community)
2. 啟動 MongoDB 服務：
   ```bash
   # Windows
   net start MongoDB
   
   # macOS (使用 Homebrew)
   brew services start mongodb-community
   
   # Linux (使用 systemd)
   sudo systemctl start mongod
   ```
3. 資料庫會自動建立，預設連線：`mongodb://localhost:27017/business-magnifier`

#### 方式二：使用 Docker (推薦)

1. 確保已安裝 Docker 和 Docker Compose
2. 啟動 MongoDB 容器：
   ```bash
   # 僅啟動 MongoDB
   docker-compose up mongodb -d
   
   # 啟動 MongoDB + 管理介面
   docker-compose --profile tools up -d
   ```
3. MongoDB 管理介面：http://localhost:8081 (mongo-express)
4. 連線字串：`mongodb://admin:password@localhost:27017/business-magnifier?authSource=admin`

### 4. 資料遷移

執行 AI 工具資料遷移：

```bash
# 遷移 promptTools.ts 中的 AI 工具到 MongoDB
npm run migrate:aitools

# 或手動執行
npx ts-node src/lib/database/migration/migrateAITools.ts
```

## 🛠️ 開發指令

### 本地開發

```bash
# 開發模式 (需要先啟動 MongoDB)
npm run dev

# 建置專案
npm run build

# 生產模式預覽
npm run start

# 程式碼檢查
npm run lint

# 資料遷移
npm run migrate:aitools
```

### Docker 開發

```bash
# 啟動 MongoDB 服務
docker-compose up mongodb -d

# 啟動 MongoDB + 管理介面
docker-compose --profile tools up -d

# 啟動完整應用程式 (包含 Next.js 容器)
docker-compose --profile full-stack up -d

# 查看服務狀態
docker-compose ps

# 查看日誌
docker-compose logs -f mongodb

# 停止所有服務
docker-compose down

# 清理資料 (注意：會刪除所有資料)
docker-compose down -v
```

## 📁 專案結構

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   ├── company/           # 企業查詢頁面
│   ├── tender/            # 標案查詢頁面
│   ├── aitool/            # AI 工具頁面
│   └── ...
├── components/            # React 元件
├── lib/                   # 工具函式庫
│   ├── database/          # MongoDB 相關
│   │   ├── connection.ts  # 資料庫連線
│   │   ├── models/        # Mongoose 模型
│   │   └── migration/     # 資料遷移腳本
│   ├── aitool/            # AI 工具邏輯
│   ├── company/           # 企業資料處理
│   └── tender/            # 標案資料處理
├── types/                 # TypeScript 型別
└── utils/                 # 通用工具
```

## 🗄️ 資料庫架構

### Collections

1. **companies** - 企業資料
2. **tenders** - 標案資料  
3. **aitools** - AI 工具定義
4. **userfeedback** - 使用者回饋

### 主要模型

- `Company` - 企業模型，支援完整的企業資訊
- `AITool` - AI 工具模型，包含使用統計和熱門度
- `Tender` - 標案模型 (規劃中)
- `UserFeedback` - 回饋模型 (規劃中)

### 資料庫管理

```bash
# 連線到 MongoDB (本地)
mongosh mongodb://localhost:27017/business-magnifier

# 連線到 Docker MongoDB
mongosh mongodb://admin:password@localhost:27017/business-magnifier?authSource=admin

# 查看集合
show collections

# 查看企業資料
db.companies.find().limit(5)

# 查看 AI 工具
db.aitools.find().limit(5)
```

## 🔄 資料遷移指南

### AI 工具遷移

將 `promptTools.ts` 中的 5960 行 AI 工具定義遷移到 MongoDB：

```typescript
import { runFullMigration } from './src/lib/database/migration/migrateAITools';

// 執行完整遷移流程
await runFullMigration();
```

遷移包含：
- ✅ 資料格式轉換
- ✅ 分類自動推斷  
- ✅ 索引建立
- ✅ 驗證檢查
- ✅ 熱門度初始化

## 🐳 Docker 部署

### 開發環境

```bash
# 建立並啟動所有服務
docker-compose up -d

# 僅啟動資料庫
docker-compose up mongodb -d

# 啟動資料庫 + 管理介面
docker-compose --profile tools up -d
```

### 生產環境

```bash
# 建置應用程式映像
docker build -t business-magnifier:latest .

# 啟動生產環境
docker-compose --profile full-stack up -d
```

### 服務端點

- **Next.js 應用程式**: http://localhost:3000
- **MongoDB**: localhost:27017
- **Mongo Express 管理介面**: http://localhost:8081

## 🚀 部署

### Netlify 部署

1. 連接 GitHub 儲存庫
2. 設定建置指令：`npm run build`
3. 設定環境變數 (不包含 MONGODB_URI，需要外部 MongoDB)
4. 自動部署

### 自架伺服器部署

1. 部署 MongoDB 容器
2. 設定 Next.js 應用程式
3. 配置反向代理 (Nginx)
4. 設定 SSL 憑證

### 環境變數 (生產環境)

```env
MONGODB_URI=mongodb://your-production-mongodb-host:27017/business-magnifier
GOOGLE_AI_API_KEY=...
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...
JWT_SECRET=...
NODE_ENV=production
```

## 📊 效能優化

- ✅ MongoDB 索引優化
- ✅ Next.js 圖片優化
- ✅ 程式碼分割
- ✅ 靜態生成 (SSG)
- ✅ 增量靜態再生 (ISR)
- ✅ Docker 多階段建置

## 🔍 SEO 優化

- ✅ 動態 meta 標籤
- ✅ 結構化資料 (JSON-LD)
- ✅ 網站地圖自動生成
- ✅ Open Graph 支援
- ✅ Core Web Vitals 優化

## 🛠️ 開發工具

### 資料庫管理

- **Mongo Express**: http://localhost:8081 (Docker 環境)
- **MongoDB Compass**: 圖形化管理工具
- **mongosh**: 命令列工具

### 監控和除錯

```bash
# 查看 MongoDB 日誌
docker-compose logs -f mongodb

# 查看應用程式日誌
docker-compose logs -f app

# 進入 MongoDB 容器
docker exec -it business-magnifier-mongo mongosh

# 檢查資料庫健康狀態
curl http://localhost:3000/api/health
```

## 🤝 貢獻指南

1. Fork 專案
2. 建立功能分支
3. 提交變更
4. 發起 Pull Request

## 📄 授權

MIT License