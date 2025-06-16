# Business Magnifier

`Business Magnifier` 是一個先進的商業分析儀表板，旨在透過數據視覺化、AI 洞察和自動化工具，為企業決策者提供強大的支援。本專案採用現代化的技術棧，並擁有高度整合的開發與部署流程。

## ✨ 核心功能（Key Features）

- **📄 AI 驅動的內容生成**: 整合 Google Gemini AI，自動分析數據並生成報告與建議。
- **📊 互動式數據圖表**: 使用 Chart.js 呈現多維度的商業數據分析圖表。
- **🗺️ 地理資訊視覺化**: 透過 Google Maps API 將地理數據與業務指標結合。
- **🔐 使用者驗證系統**: 完整的 JWT（JSON Web Token） 登入、註冊與權限管理。
- **📧 自動化郵件通知**: 使用 Nodemailer 實現使用者註冊、密碼重設等郵件通知。
- **🔍 SEO 優化**: 內建 Schema.org（JSON-LD） 結構化資料與 Sitemap 監控，以提升搜尋引擎排名。
- **📁 檔案上傳**: 支援拖放式檔案上傳，用於數據匯入或其他用途。

## 🛠️ 技術棧（Tech Stack）

| 類別 | 技術 |
| :--- | :--- |
| **框架** | Next.js 14+（App Router）, React 18 |
| **語言** | TypeScript |
| **樣式** | Tailwind CSS, Framer Motion |
| **資料庫** | MongoDB（with Mongoose） |
| **AI 整合** | Google Generative AI（Gemini） |
| **API & 驗證** | Next.js API Routes, JSON Web Token（JWT） |
| **部署/環境** | Docker, Docker Compose, Netlify |
| **程式碼品質** | ESLint, Prettier |
| **核心依賴**| Chart.js, Google Maps API, Nodemailer |

## 🚀 快速上手（Getting Started）

本專案強烈建議使用 Docker 進行開發，以確保環境一致性。

### 1. 先決條件

- [Docker](https://www.docker.com/get-started)
- [Node.js](https://nodejs.org/)（v18 或更高版本）
- [npm](https://www.npmjs.com/get-npm) 或 [pnpm](https://pnpm.io/installation)

### 2. 專案設置

```bash
# Clone 專案庫
git clone <your-repository-url>
cd business-magnifier

# 進入 Next.js 專案目錄
cd next

# 安裝依賴
npm install
```

### 3. 環境變數設定

在 `next/` 目錄下建立一個 `.env.local` 檔案，並填入以下內容。

```env
# MongoDB 連線（Docker 環境）
MONGODB_URI=mongodb://admin:password@localhost:27017/business-magnifier?authSource=admin

# Google 服務 API
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# 身份驗證
JWT_SECRET=your_jwt_secret_key_here_with_sufficient_length

# 郵件服務（可選）
NEXT_PUBLIC_DEVELOPER_EMAIL=your_email@gmail.com
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=465
EMAIL_SERVER_USER=your_email@gmail.com
EMAIL_SERVER_PASSWORD=your_app_password
EMAIL_FROM=your_email@gmail.com
EMAIL_FROM_NAME="Business Magnifier 客戶支援"
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

## 📜 主要腳本（Available Scripts）

所有指令皆在 `next/` 目錄下執行。

### 核心開發
- `npm run dev`: 在本地（非 Docker）啟動 Next.js 開發伺服器。
- `npm run build`: 建置生產版本的應用程式。
- `npm run lint`: 執行 ESLint 程式碼檢查。
- `npm run format:fix`: 使用 Prettier 和 ESLint 自動修復格式與問題。

### Docker 環境管理
- `npm run start:dev`: 啟動完整的開發環境。
- `npm run start:prod`: 啟動完整的生產環境。
- `npm run stop`: 停止所有 Docker 容器並進行清理。
- `npm run docker:logs`: 查看所有容器的日誌。
- `npm run docker:dev:logs`: 僅查看開發應用程式的日誌。
- `npm run docker:down`: 停止並移除所有容器。

### 資料庫
- `npm run db:init`: 初始化資料庫 Collections。
- `npm run db:backup`: 備份 AI Tools 相關資料。
- `npm run db:restore`: 還原 AI Tools 相關資料。
- `npm run db:connect-docker`: 連接到 Docker 中的 MongoDB 實例。

## 📁 專案結構概覽

```
.
├── .cursor/           # AI 輔助開發規則
├── legacy/            # 🗄️ 舊版 Vite 專案（即將淘汰）
├── next/              # 🎯 主要 Next.js 應用程式
│   ├── src/
│   │   ├── app/       # App Router 頁面與 API
│   │   ├── components/ # 可複用的 React 元件
│   │   ├── config/    # 專案設定檔
│   │   ├── lib/       # 核心函式庫（DB 連接, 驗證邏輯...）
│   │   └── ...
│   ├── scripts/       # 自動化腳本（DB初始化, 部署, 備份...）
│   ├── public/        # 靜態資源
│   ├── package.json
│   └── docker-compose.yml
└── README.md
```

## 🗄️ 資料庫架構

### MongoDB Collections
- **`companies`** - 企業基本資料與詳細資訊
- **`ai_tools`** - AI 工具定義與使用統計
- **`tenders`** - 政府標案資料與查詢記錄