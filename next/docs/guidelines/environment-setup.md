# 開發環境配置規範

## 環境定義

本專案僅支援兩種標準化環境，所有開發工作均須在以下環境中進行：

### 🔧 開發環境 (Development Environment)

- **啟動指令**：`npm run reset:dev`
- **用途**：日常開發、測試、除錯
- **特色**：啟用開發模式、詳細日誌、熱重載

### 🚀 正式環境 (Production Environment)

- **啟動指令**：`npm run reset:prod`
- **用途**：正式部署、效能測試、最終驗證
- **特色**：最佳化建置、生產級設定、效能監控

## Docker 容器架構

兩種環境均透過 Docker 容器化運行，包含以下三個核心容器：

### 容器組成

1. **`app-dev`** - Next.js 應用程式容器
2. **`mongo-express`** - MongoDB 網頁管理介面
3. **`mongo`** - MongoDB 資料庫伺服器

### 容器連接埠對應

- **應用程式**：http://localhost:3000
- **MongoDB Express**：http://localhost:8081
- **MongoDB 直連**：mongodb://localhost:27017

## 環境重置流程

### `npm run reset` 執行內容

執行環境重置時，系統會自動執行以下流程：

```bash
# reset:dev 實際執行的指令序列：
npm run stop                    # 停止所有 Docker 容器
npm run docker:purge           # Docker 系統清理
npm run start:dev              # 啟動開發環境容器群組
npm run db:full-restore        # 完整資料庫還原與索引重建

# reset:prod 實際執行的指令序列：
npm run stop                    # 停止所有 Docker 容器
npm run docker:purge           # Docker 系統清理
npm run start:prod             # 啟動正式環境容器群組
npm run db:full-restore        # 完整資料庫還原與索引重建
```

#### 1. 停止階段 (`npm run stop`)

- 停止所有 Docker 容器

#### 2. 清理階段 (`npm run docker:purge`)

```bash
# 實際執行內容：
docker compose down -v --remove-orphans  # 移除容器、網路、卷
docker system prune -a --volumes -f      # 清理 Docker 系統快取
npm cache clean --force                   # 清空 npm 快取
```

#### 3. 啟動階段 (`npm run start:dev` / `npm run start:prod`)

```bash
# 開發環境：
docker compose --profile dev --profile tools up -d

# 正式環境：
docker compose --profile prod up -d
```

#### 4. 資料庫還原階段 (`npm run db:full-restore`)

- 在 Docker 容器啟動完成後執行
- 進行完整資料庫還原與索引重建

#### 5. 背景服務初始化（透過 `/app/scripts/entrypoint.sh`）

容器啟動後會自動在背景執行：

```bash
npm run sitemap:monitor    # 啟動網站地圖監控器（背景執行）
npm run db:reset-keys      # 啟動 API 金鑰每日重置排程（背景執行）
```

## 資料庫連線規範

### 🚨 重要提醒

資料庫連線必須嚴格遵循以下認證資訊，否則會導致連線失敗：

### 連線字串格式

```bash
MONGODB_URI=mongodb://admin:password@localhost:27017/corp-insight?authSource=admin
```

### 認證參數說明

- **使用者名稱**：`admin`
- **密碼**：`password`
- **主機位址**：`localhost`
- **連接埠**：`27017`
- **資料庫名稱**：`corp-insight`
- **認證來源**：`admin`

### 設定檔參考

所有資料庫連線參數請參照：`/projects/Corp-Insight/next/.env.example`

## AI Assistant 應對規範

### 環境識別關鍵詞

當使用者提及以下詞彙時，AI Assistant 應立即識別對應環境：

**開發環境觸發詞**：

- 開發環境、開發模式、dev 環境
- 測試環境、除錯環境
- `npm run reset:dev`

**正式環境觸發詞**：

- 正式環境、生產環境、prod 環境
- 部署環境、上線環境
- `npm run reset:prod`

### 標準化回應

AI Assistant 應使用統一的環境描述與指令建議，確保團隊溝通的一致性。

## 故障排除

### 常見問題與解決方案

**容器啟動失敗**：

```bash
npm run reset:dev  # 或 reset:prod - 完整重置環境
```

**資料庫連線失敗**：

1. 確認 `.env` 檔案使用正確的連線字串
2. 檢查 MongoDB 容器是否正常運行：`docker ps`
3. 重新執行環境重置：`npm run reset:dev`

**埠號衝突**：

```bash
# 檢查埠號佔用
netstat -tulpn | grep :3000
netstat -tulpn | grep :27017
netstat -tulpn | grep :8081

# 強制停止佔用的程序後重新啟動環境
npm run reset:dev
```

**Docker 快取問題**：

```bash
# docker:purge 會自動清理，但如仍有問題可手動執行：
docker system prune -a --volumes -f
npm run start:dev
```

## 重要澄清

### ❌ 環境重置 **不會** 執行以下動作：

- **不會移除** `node_modules` 目錄
- **不會執行** `npm install`
- **不會影響** 本機檔案系統的 Node.js 相依套件

### ✅ 環境重置 **只會** 影響：

- Docker 容器與映像檔
- Docker 卷與網路設定
- npm 快取
- 容器內的資料庫狀態

## 環境維護

### 定期維護建議

- **每日開發前**：執行 `npm run reset:dev` 確保環境乾淨
- **功能測試前**：執行 `npm run reset:prod` 模擬正式環境
- **週期性清理**：環境重置已包含必要的清理動作

### 監控指標

- Docker 容器健康狀態
- 資料庫連線穩定性
- 應用程式回應時間
- 系統資源使用率

---

**最後更新**：2025-08-18
**維護者**：BMad Method Team
