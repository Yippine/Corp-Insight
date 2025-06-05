# Business Magnifier - Next.js 版本

企業資訊查詢平台的現代化重構版本，採用 Next.js 14 + MongoDB 架構，實現 SEO 優化的企業與標案查詢服務。

## 🚀 專案特色

- **🔍 企業資訊查詢**: 整合多元企業資料源，提供詳細企業資訊
- **📋 政府標案查詢**: 完整的政府標案資料庫與搜尋功能  
- **🤖 AI 工具集成**: 超過 5000+ AI 工具，協助企業智能化決策
- **📊 視覺化圖表**: 企業營收、標案趨勢等數據視覺化分析
- **🗺️ 地理位置服務**: Google Maps 整合，企業地理分布查詢
- **📱 響應式設計**: 完美支援桌面端與行動裝置
- **⚡ 效能優化**: SSR/SSG 混合渲染，Core Web Vitals 最佳化
- **🔒 資料安全**: JWT 身份驗證，安全的資料傳輸

## 🏗️ 技術棧

### 核心框架
- **前端框架**: Next.js 14.1.0 + React 18.2.0 + TypeScript 5.8.2
- **樣式系統**: Tailwind CSS 3.4.1 + Framer Motion 11.18.2
- **資料庫**: MongoDB 7.0 + Mongoose ODM 8.0.3
- **容器化**: Docker + Docker Compose

### 整合服務
- **AI 服務**: Google Generative AI 0.24.1
- **地圖服務**: Google Maps API (@react-google-maps/api 2.20.6)
- **圖表系統**: Chart.js 4.4.8 + React Chart.js 2
- **圖示系統**: Lucide React 0.479.0

### 開發工具
- **程式碼品質**: ESLint + Prettier + TypeScript
- **版本控制**: Git (主要開發分支: `next`)
- **部署平台**: Netlify + 自架 Docker 環境
- **監控工具**: MongoDB 管理介面 + Docker 日誌系統

## 📦 快速開始

### 環境需求
- Node.js 18+ 
- Docker & Docker Compose
- Git

### 1. 複製專案
```bash
git clone <repository-url>
cd "3 - Business Magnifier"
```

### 2. 環境變數設定
建立 `next/.env.local` 檔案：

```env
# MongoDB 連線 (Docker 環境)
MONGODB_URI=mongodb://admin:password@localhost:27017/business-magnifier?authSource=admin

# Google 服務 API
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# 身份驗證
JWT_SECRET=your_jwt_secret_key_here

# 應用程式設定
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# 外部 API 服務
NEXT_PUBLIC_G0V_COMPANY_API=https://company.g0v.ronny.tw/api
NEXT_PUBLIC_G0V_TENDER_API=https://pcc.g0v.ronny.tw/api

# 郵件服務 (可選)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### 3. 一鍵啟動開發環境
```bash
cd next

# 安裝依賴
npm install

# 啟動完整開發環境 (MongoDB + Next.js + 管理介面)
npm run start:dev
```

### 4. 訪問應用程式
- **主應用程式**: http://localhost:3000
- **MongoDB 管理介面**: http://localhost:8081 
- **API 健康檢查**: http://localhost:3000/api/health

## 🛠️ 開發指令總覽

### 核心開發指令
```bash
# 本地開發模式
npm run dev

# 建置生產版本
npm run build

# 生產模式預覽
npm run start

# 程式碼檢查與格式化
npm run lint
npm run format
npm run format:fix
```

### Docker 環境管理
```bash
# 🚀 快速啟動 (推薦)
npm run start:dev      # 啟動開發環境 (MongoDB + App + 管理介面)
npm run start:prod     # 啟動生產環境
npm run stop           # 停止所有服務並清理

# 🐳 詳細 Docker 指令
npm run docker:mongo            # 僅啟動 MongoDB
npm run docker:tools           # 啟動 MongoDB + 管理介面
npm run docker:full-dev        # 完整開發環境
npm run docker:full-prod       # 完整生產環境

# 📊 監控與管理
npm run docker:ps              # 查看服務狀態
npm run docker:logs            # 查看所有服務日誌
npm run docker:restart         # 重啟服務
npm run docker:down            # 停止服務
npm run docker:cleanup         # 清理 Docker 資源
```

### 資料庫管理
```bash
# 🗄️ 連線資料庫
npm run db:connect             # 本地 MongoDB 連線
npm run db:connect-docker      # Docker MongoDB 連線

# 💾 資料備份與還原
npm run db:backup              # 備份 AI 工具資料
npm run db:restore             # 還原最新備份
npm run db:list                # 查看備份檔案列表
```

## 📁 專案架構

```
Business Magnifier/
├── next/                      # 🎯 主要 Next.js 應用程式
│   ├── src/
│   │   ├── app/              # App Router 頁面與 API
│   │   │   ├── company/      # 企業查詢功能
│   │   │   ├── tender/       # 標案查詢功能  
│   │   │   ├── aitool/       # AI 工具功能
│   │   │   ├── api/          # 後端 API 路由
│   │   │   └── ...
│   │   ├── components/       # React 元件庫
│   │   ├── lib/              # 工具函式與資料庫連線
│   │   ├── hooks/            # 自定義 React Hooks
│   │   ├── types/            # TypeScript 型別定義
│   │   └── utils/            # 通用工具函式
│   ├── public/               # 靜態資源
│   ├── scripts/              # 資料庫管理腳本
│   ├── db/backups/           # 資料庫備份檔案
│   └── docker-compose.yml    # Docker 服務編排
├── legacy/                    # 🗄️ 舊版 Vite 專案 (即將淘汰)
└── .cursor/rules/             # 🤖 AI 輔助開發規則
```

## 🗄️ 資料庫架構

### MongoDB Collections
- **`companies`** - 企業基本資料與詳細資訊
- **`aitools`** - AI 工具定義與使用統計 (100+ 工具)
- **`tenders`** - 政府標案資料與查詢記錄  
- **`userfeedback`** - 使用者回饋與建議

### 主要資料模型
```typescript
// 企業模型
interface Company {
  id: string;
  name: string;
  taxId: string;
  industry: string;
  address: string;
  coordinates?: [number, number];
  revenue?: CompanyRevenue[];
  // ... 更多欄位
}

// AI 工具模型  
interface AITool {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  url: string;
  popularity: number;
  usageCount: number;
  // ... 更多欄位
}
```

## 🚀 部署方案

### Netlify 部署 (推薦)
1. 連接 GitHub 儲存庫至 Netlify
2. 設定建置指令: `cd next && npm run build`
3. 配置環境變數 (需要外部 MongoDB 服務)
4. 自動部署至 CDN

### Docker 自架部署
```bash
# 建置生產映像
docker build -t business-magnifier:latest ./next

# 啟動生產環境
npm run start:prod

# 配置 Nginx 反向代理 (可選)
# 設定 SSL 憑證 (可選)
```

### 環境變數 (生產環境)
```env
NODE_ENV=production
MONGODB_URI=mongodb://your-production-host:27017/business-magnifier
GOOGLE_AI_API_KEY=...
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...
JWT_SECRET=...
```

## 📊 效能與 SEO 優化

### 🎯 已實現優化
- ✅ **渲染策略**: SSR/SSG/ISR 混合渲染
- ✅ **程式碼分割**: 自動代碼分割與懶載入
- ✅ **圖片優化**: Next.js Image 組件優化  
- ✅ **快取策略**: 多層級快取機制
- ✅ **資料庫索引**: MongoDB 查詢效能優化
- ✅ **Docker 優化**: 多階段建置，減少映像大小

### 📈 SEO 功能
- ✅ **動態 Meta 標籤**: 基於內容的 SEO 標籤
- ✅ **結構化資料**: JSON-LD 格式的豐富摘要
- ✅ **網站地圖**: 自動產生 sitemap.xml
- ✅ **Open Graph**: 社群媒體分享優化
- ✅ **Core Web Vitals**: 載入效能最佳化

## 🔧 開發工具整合

### 資料庫管理工具
- **Mongo Express**: http://localhost:8081 (Docker 環境)
- **MongoDB Compass**: 圖形化管理工具 (可選安裝)
- **mongosh**: 命令列工具

### 程式碼品質工具
```bash
# 程式碼格式化
npm run format

# ESLint 檢查與修復
npm run lint
npm run format:fix

# TypeScript 型別檢查
npx tsc --noEmit
```

### 監控與除錯
```bash
# Docker 服務監控
npm run docker:logs            # 查看所有服務日誌
npm run docker:ps              # 查看服務狀態

# 特定服務日誌
docker-compose logs -f mongodb        # MongoDB 日誌
docker-compose logs -f app-dev         # 應用程式日誌

# 進入容器除錯
docker exec -it business-magnifier-mongo mongosh
```

## 🎉 最新功能亮點

### 🤖 AI 工具整合 (新)
- 超過 100+ AI 工具資料庫
- 智能分類與標籤系統
- 熱門度排序與使用統計
- 一鍵查詢與收藏功能

### 📊 視覺化分析 (增強)
- 企業營收趨勢圖表
- 標案分佈地理視覺化
- 行業競爭力分析圖表
- 互動式資料儀表板

### 🔄 資料管理系統 (全新)
- 自動化資料備份機制
- 一鍵資料還原功能
- 資料庫健康監控
- 智能快取管理

## 🤝 開發貢獻

### 開發流程
1. Fork 專案並切換到 `next` 分支
2. 建立功能分支: `git checkout -b feature/your-feature`
3. 開發並測試功能
4. 提交變更: 遵循 [Conventional Commits](https://conventionalcommits.org/)
5. 發起 Pull Request 至 `next` 分支

### Commit 訊息格式
```
[type] Subject line

- feat: 新功能
- fix: 錯誤修復  
- docs: 文檔更新
- style: 格式調整
- refactor: 程式碼重構
- test: 測試相關
- chore: 其他維護
```

## 📞 支援與回饋

- **問題回報**: GitHub Issues
- **功能建議**: 應用程式內回饋功能
- **技術支援**: 開發團隊聯繫方式
- **文檔更新**: 持續更新專案文檔

## 📄 授權條款

MIT License - 詳見 LICENSE 檔案

---

**⭐ 如果這個專案對你有幫助，請給我們一個 Star！**

> **💡 專案狀態**: 積極開發中 (主要分支: `next`)  
> **🔄 最後更新**: 2025年6月 | **版本**: v0.1.0