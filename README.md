# Corp Insight

## 🤖 企業洞察平台

<div align="center">
  <a href="https://youtu.be/EMedbGk9KlI" target="_blank" rel="noopener noreferrer">
    <img src="https://img.youtube.com/vi/EMedbGk9KlI/maxresdefault.jpg" alt="產品功能展示影片" style="width:80%; border-radius:10px;">
  </a>
  <br/>
  <sub>點擊圖片觀看產品功能展示影片 🚀</sub>
</div>

## ✨ 核心功能

- **🏢 企業資料查詢**
- **📋 政府採購標案**
- **🤖 AI 智慧助理**
- **📊 互動式數據圖表**
- **🗺️ Google Map**
- **🔐 使用者回饋**
- **🔍 SEO 優化**

## 🛠️ 技術棧

| 類別 | 技術 |
| :------------- | :---------------------------------------- |
| **框架** | Next.js 14 (App Router), React 18 |
| **語言** | TypeScript |
| **樣式** | Tailwind CSS |
| **資料庫** | MongoDB (with Mongoose) |
| **AI 整合** | Gemini (串流輸出) |
| **部署/環境** | Docker (Standalone 迷數) |

## 🚀 快速上手

本專案強烈建議使用 Docker 進行開發，以確保環境一致性。

### 1. 先決條件

- [Docker](https://www.docker.com/get-started)
- [Node.js](https://nodejs.org/)（v18 或更高版本）
- [npm](https://www.npmjs.com/get-npm) 或 [pnpm](https://pnpm.io/installation)

### 2. 專案設置

```bash
# Clone 專案庫
git clone <your-repository-url>
cd corp-insight

# 進入 Next.js 專案目錄
cd next

# 安裝依賴
npm install
```

### 3. 環境變數設定

在專案根目錄下，將 `next/.env.example` 複製一份並命名為 `next/.env.local`。然後，填入必要的環境變數。

```bash
# 這是環境變數的範本檔案。
# 在開發前，請將此檔案複製為 .env.local，並填入您的實際金鑰。
# ⚠️ 注意：.env.local 檔案絕不應該被提交到版本控制系統 (Git) 中。

# 💡 --- 核心基礎設施 ---
# MongoDB 資料庫連線字串
MONGODB_URI=mongodb://admin:password@localhost:27017/corp-insight?authSource=admin

# 網站的公開基礎 URL (用於 SEO, Sitemap, CORS 等)
# 開發時使用 http://localhost:3000, 生產環境請填寫您的域名
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# 💡 --- Google 服務 ---
# Google AI (Gemini) API 金鑰
NEXT_PUBLIC_GOOGLE_AI_API_KEY=

# Google Maps API 金鑰 (用於公司地圖)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=

# Google Analytics 追蹤 ID
NEXT_PUBLIC_GA_ID=

# 💡 --- 安全與認證 ---
# 用於簽署「使用者回饋」功能的 JWT 密鑰
JWT_SECRET=

# 管理員後端 API 的存取權杖
ADMIN_SECRET_TOKEN=

# 管理員前端請求的授權權杖 (值必須與 ADMIN_SECRET_TOKEN 相同)
NEXT_PUBLIC_ADMIN_SECRET_TOKEN=

# 💡 --- 郵件服務 (用於使用者回饋) ---
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=465
EMAIL_SERVER_USER=
EMAIL_SERVER_PASSWORD=
EMAIL_FROM=
EMAIL_FROM_NAME="Corp Insight 客戶支援"
# 開發人員聯絡信箱 (用於接收系統錯誤通知)
NEXT_PUBLIC_DEVELOPER_EMAIL=

# 💡 --- AWS
# 用於透過 AWS Session Manager 進行遠端存取的 EC2 實例 ID。
EC2_INSTANCE_ID="YOUR_EC2_INSTANCE_ID_HERE"
```

### 4. 啟動開發環境

此指令會一次性啟動 Next.js 應用程式（開發模式）、MongoDB 資料庫以及 Mongo Express 管理介面。

```bash
# 確保你在 next/ 目錄下
npm run start:dev
```

### 5. 初始化資料庫（首次啟動）

在新終端機分頁中，執行資料庫初始化腳本，它會根據 `scripts/init-mongodb-collections.js` 建立必要的 Collections。

```bash
# 確保你在 next/ 目錄下
npm run db:init
```

現在，您可以透過以下連結訪問服務：

- **應用程式**: [http://localhost:3000](http://localhost:3000)
- **Mongo Express**: [http://localhost:8081](http://localhost:8081)（使用 `admin`/`password` 登入）

## 📜 主要腳本

所有指令皆在 `next/` 目錄下執行。

### 核心開發

- `npm run dev`: 在本地（非 Docker）啟動 Next.js 開發伺服器
- `npm run build`: 建置正式版本的應用程式
- `npm run lint`: 執行 ESLint 程式碼檢查
- `npm run format`: 使用 Prettier 自動格式化程式碼
- `npm run format:fix`: 修正 ESLint + Prettier 問題

### Docker 環境管理

- `npm run start:dev`: 啟動開發環境含 MongoDB + 工具
- `npm run start:prod`: 啟動正式環境測試
- `npm run restart:dev`: 重啟開發服務
- `npm run stop`: 停止所有 Docker 服務
- `npm run rebuild:dev`: 完整重建開發環境
- `npm run docker:logs`: 查看所有容器的日誌
- `npm run docker:dev:logs`: 僅查看開發應用程式的日誌

### 資料庫管理

- `npm run db:setup`: 啟動 MongoDB + 初始化集合
- `npm run db:init`: 初始化資料庫集合
- `npm run db:backup`: 備份所有資料
- `npm run db:restore`: 從最新備份還原
- `npm run db:full-restore`: 還原 + 重建索引
- `npm run db:ai:import`: 匯入所有 AI 工具批次
- `npm run db:ai:tags`: 列出 AI 工具標籤

### API 金鑰管理

- `npm run validate:gemini`: 驗證 Gemini API 金鑰
- `npm run test:gemini`: 測試金鑰策略（故障轉移/輪詢）

### 健康檢查與部署

- `npm run health:check`: 應用程式健康狀態檢查
- `npm run deploy:prod`: 部署至正式伺服器
- `npm run ssh:prod`: SSH 連線至正式環境
