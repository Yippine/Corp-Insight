# 🗺️ Business Magnifier Sitemap 監控管理系統

## 🎯 系統概覽

Business Magnifier 搭載了全面的 Sitemap 監控管理系統，提供企業級的 SEO 管理和性能監控功能。

### ✨ 核心功能

- **🚀 實時狀態監控**: 監控所有 sitemap 文件的健康狀態
- **📊 性能分析**: 響應時間、內容大小、狀態追蹤
- **💾 智能緩存**: localStorage + 服務器同步的雙重緩存機制
- **🔄 自動同步**: 前端與後端狀態自動同步
- **🛠️ 命令列工具**: 完整的 npm scripts 集成

---

## 📋 Sitemap 清單

### 主要 Sitemap 文件

| 文件名 | 描述 | 更新頻率 | 緩存時間 |
|--------|------|----------|----------|
| `sitemap.xml` | 主要 Sitemap - 靜態頁面 + 動態內容 | 每小時 | 1小時 |
| `sitemap-index.xml` | Sitemap 索引 - 管理所有 sitemap | 每日 | 2小時 |
| `sitemap-companies.xml` | 企業 Sitemap - 50,000 頁面 | 每週 | 2小時 |
| `sitemap-tenders.xml` | 標案 Sitemap - 25,000 頁面 | 每月 | 4小時 |
| `sitemap-aitools.xml` | AI 工具 Sitemap - 5,000 頁面 | 每週 | 3小時 |
| `robots.txt` | 搜索引擎爬蟲指令 | 手動更新 | 24小時 |

---

## 💻 命令列操作

### 基本測試指令

```bash
# 測試所有 sitemap 文件
npm run sitemap:test

# 查看當前狀態
npm run sitemap:status

# 清除本地緩存
npm run sitemap:clear-cache
```

### 自動監控指令

```bash
# 啟動後台監控 (5分鐘間隔)
npm run sitemap:monitor

# 停止監控程序
npm run sitemap:stop
```

---

## 🖥️ Web 管理介面

訪問 `/sitemap-manager` 頁面使用圖形化管理介面：

### 功能特色

- **🎯 狀態卡片**: 每個 sitemap 的詳細狀態顯示
- **📈 統計儀表板**: 系統整體健康度和性能指標
- **🔄 一鍵測試**: 批量測試所有 sitemap
- **🎨 美觀設計**: 響應式設計，支援中文最佳閱讀體驗

### 狀態指示器

- 🟢 **成功** (綠色): Sitemap 正常運作
- 🟡 **警告** (黃色): 響應慢或部分問題
- 🔴 **錯誤** (紅色): 無法訪問或錯誤
- 🔵 **測試中** (藍色): 正在檢測狀態

---

## 🏗️ 技術架構

### 前端組件

```
SitemapManager.tsx              # 主管理頁面
├── SitemapStatusCard.tsx       # 狀態卡片組件
├── SitemapStatsDashboard.tsx   # 統計儀表板
└── useSitemapStatus.ts         # 狀態管理 Hook
```

### 後端腳本

```
scripts/sitemap-monitor.js      # 監控腳本
├── 測試功能                   # 單次和批量測試
├── 監控功能                   # 後台自動監控
├── 狀態管理                   # 文件狀態同步
└── 緩存機制                   # 智能緩存系統
```

### 數據流程

```
Terminal Script → .sitemap-status.json → Frontend Hook → UI Components
     ↑                                                           ↓
   npm 指令                                                  用戶操作
```

---

## 📊 監控數據

### 性能指標

- **響應時間**: 每次請求的延遲時間
- **內容大小**: Sitemap 文件大小追蹤
- **成功率**: 可用性百分比統計
- **檢測頻率**: 自動和手動檢測記錄

### 緩存策略

- **本地緩存**: localStorage，5分鐘有效期
- **服務器緩存**: JSON 文件，跨會話持久化
- **智能同步**: 自動檢測最新數據源

---

## 🚀 部署說明

### AWS EC2 部署

```bash
# 安裝依賴
npm install

# 啟動監控
npm run sitemap:monitor

# 驗證狀態
npm run sitemap:status
```

### 自動化集成

- **CI/CD**: 可整合到部署流程
- **健康檢查**: 系統自檢和報警
- **日誌記錄**: 完整的操作和錯誤日誌

---

## 🔧 故障排除

### 常見問題

**Q: 監控程序無法啟動？**
```bash
npm run sitemap:stop
npm run sitemap:monitor
```

**Q: 狀態不同步？**
```bash
npm run sitemap:clear-cache
npm run sitemap:test
```

**Q: 前端顯示舊數據？**
- 刷新頁面或清除瀏覽器緩存
- 檢查 localStorage 中的 `sitemap-status` 項目

### 調試模式

```bash
# 檢查狀態文件
cat .sitemap-status.json

# 檢查監控進程
npm run sitemap:status

# 手動測試單個 sitemap
curl http://localhost:3000/sitemap.xml
```

---

## 🎨 UI/UX 設計特色

### 中文優化
- **字體大小**: 針對中文閱讀習慣優化
- **間距設計**: 適合中文內容的視覺層次
- **色彩搭配**: 企業級專業色調

### 互動體驗
- **懸停效果**: 精緻的 hover 動畫
- **漸變背景**: 現代化視覺設計
- **響應式布局**: 適配所有設備尺寸

---

## 📈 效能優化

### 前端優化
- **並行請求**: 同時測試多個 sitemap
- **防抖處理**: 避免重複請求
- **錯誤處理**: 優雅的錯誤恢復機制

### 後端優化
- **超時控制**: 10秒請求超時
- **記憶體管理**: 高效的數據結構
- **進程管理**: PID 基礎的進程控制

---

## 🛡️ 安全性

### 訪問控制
- 僅限內部管理使用
- 無敏感數據洩露
- 安全的文件操作

### 錯誤處理
- 詳細的錯誤日誌
- 優雅的失敗恢復
- 防止系統崩潰

---

## 🎯 未來規劃

- [ ] **通知系統**: 異常自動報警
- [ ] **歷史數據**: 長期性能趨勢分析
- [ ] **A/B 測試**: Sitemap 優化實驗
- [ ] **API 接口**: RESTful API 支援
- [ ] **多環境**: 開發/測試/生產環境分離

---

## 📝 更新日誌

### v1.0.0 (2025-06-05)
- ✅ 完整的 sitemap 監控系統
- ✅ 命令列工具集成
- ✅ Web 管理介面
- ✅ 智能緩存機制
- ✅ 中文優化設計

---

**🎉 恭喜！Business Magnifier Sitemap 監控管理系統已完成部署！**

使用 `npm run sitemap:test` 開始你的第一次檢測吧！ 🚀