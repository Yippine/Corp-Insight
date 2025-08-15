# Corp Insight

`Corp Insight` 是一個專業的台灣企業資訊查詢平台，整合企業資料搜尋、政府採購標案管理與 AI 智慧工具，為使用者提供全面的商業情報服務。本專案採用 Next.js 14 現代化技術堆疊，並具備完整的 Docker 化開發與部署環境。

<div align="center">
  <a href="https://youtu.be/EMedbGk9KlI" target="_blank" rel="noopener noreferrer">
    <img src="https://img.youtube.com/vi/EMedbGk9KlI/maxresdefault.jpg" alt="產品功能展示影片" style="width:80%; border-radius:10px;">
  </a>
  <br/>
  <sub>點擊圖片觀看產品功能展示影片 🚀</sub>
</div>

## ✨ 核心功能（Key Features）

- **🏢 企業資料查詢**: 整合 g0v 企業 API，提供台灣企業基本資料、董事經理人資訊與統計分析。
- **📋 政府採購標案**: 完整的標案搜尋、詳細資訊檢視與相關企業分析功能。
- **🤖 AI 智慧工具**: 整合 Google Gemini AI，提供聊天機器人與各類 AI 輔助工具。
- **📊 互動式數據圖表**: 使用 Chart.js 呈現企業統計、董事變更時間軸等視覺化圖表。
- **🗺️ 地理資訊視覺化**: 透過 Google Maps API 顯示企業地理位置資訊。
- **🔐 回饋系統**: 完整的使用者回饋機制，支援 JWT 驗證與郵件通知。
- **🔍 SEO 優化**: 內建結構化資料、動態 Sitemap 產生與監控系統。
- **📱 響應式設計**: 使用 Tailwind CSS 打造的現代化響應式使用者介面。

## 🛠️ 技術棧（Tech Stack）

| 類別           | 技術                                      |
| :------------- | :---------------------------------------- |
| **框架**       | Next.js 14（App Router）, React 18        |
| **語言**       | TypeScript                                |
| **樣式**       | Tailwind CSS, Framer Motion               |
| **資料庫**     | MongoDB（with Mongoose）                  |
| **AI 整合**    | Google Generative AI（Gemini）含串流支援   |
| **UI 元件**    | Radix UI, 客製化 shadcn/ui 元件           |
| **圖表**       | Chart.js, react-chartjs-2                |
| **地圖**       | Google Maps API                           |
| **API & 驗證** | Next.js API Routes, JWT                   |
| **部署/環境**  | Docker, Docker Compose, Standalone 模式   |
| **程式碼品質** | ESLint, Prettier                          |

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

## 📜 主要腳本（Available Scripts）

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

## 📁 專案結構概覽

```
.
├── next/              # 🎯 主要 Next.js 應用程式
│   ├── src/
│   │   ├── app/       # Next.js 14 App Router 頁面與 API 路由
│   │   │   ├── api/   # API 路由 (company, tender, aitool, gemini)
│   │   │   ├── company/   # 企業搜尋與詳細頁面
│   │   │   ├── tender/    # 標案搜尋與詳細頁面
│   │   │   └── aitool/    # AI 工具與聊天機器人功能
│   │   ├── components/    # 可重複使用的 React 元件
│   │   │   ├── common/    # 共用元件 (載入、分頁)
│   │   │   ├── aitool/    # AI 工具專用元件
│   │   │   ├── company/   # 企業相關元件
│   │   │   └── tender/    # 標案相關元件
│   │   ├── lib/           # 核心商業邏輯與工具程式
│   │   │   ├── database/  # MongoDB 模型與連線
│   │   │   ├── aitool/    # AI 工具資料管理
│   │   │   ├── company/   # 企業 API 與資料解析
│   │   │   └── tender/    # 標案 API 與資料處理
│   │   ├── hooks/         # 客製化 React hooks
│   │   └── config/        # 專案設定檔
│   ├── scripts/           # 自動化腳本（DB 初始化、部署、備份）
│   ├── docs/              # 專案文件與架構說明
│   ├── prompts/           # AI 工具提示範本與批次資料
│   ├── public/            # 靜態資源
│   ├── docker-compose.yml # Docker 服務編排設定
│   ├── package.json       # 專案依賴與腳本
│   └── CLAUDE.md          # Claude Code 開發指引
└── README.md
```

## 🗄️ 資料庫架構

### MongoDB Collections

- **`companies`** - 企業基本資料、董事經理人資訊與統計數據
- **`ai_tools`** - AI 工具定義、提示範本與使用統計
- **`feedback`** - 使用者回饋系統資料
- **`api_key_status`** - API 金鑰管理與輪替狀態

### 主要資料模型

- **Company**: 企業資料含董事、經理人與統計資訊
- **AITool**: AI 智慧工具含提示範本
- **Feedback**: 使用者回饋系統
- **ApiKeyStatus**: API 金鑰管理與輪替

## 🔑 重要開發注意事項

- 首次設定需要初始化資料庫（`npm run db:setup`）
- 建議使用 Docker 環境確保開發一致性
- AI 功能需要有效的 Gemini API 金鑰
- 企業搜尋依賴外部 g0v API 可用性
- 正式部署使用 Next.js standalone 輸出模式
- 支援多組 Gemini API 金鑰輪替（逗號分隔）

更多詳細的開發指引請參考 [CLAUDE.md](next/CLAUDE.md) 檔案。
