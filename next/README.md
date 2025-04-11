# Business Magnifier - SEO 優化企業資訊平台

## 專案介紹
Business Magnifier 是一個使用 Next.js 構建的企業資訊查詢平台，專注於提供高性能、SEO 友好的企業和標案資料。

## 技術棧
- Next.js 14
- React 18
- Prisma ORM
- TypeScript

## 環境要求
- Node.js 18+ 
- npm 9+

## 安裝步驟

1. 克隆專案
```bash
git clone https://github.com/yourusername/business-magnifier.git
cd business-magnifier/next
```

2. 安裝依賴
```bash
npm install
```

3. 設置環境變數
創建 `.env` 文件並配置必要的環境變數

4. 初始化數據庫
```bash
npx prisma generate
npx prisma migrate dev
```

## 運行專案

### 開發模式
```bash
npm run dev
```
訪問 `http://localhost:4173`

### 生產構建
```bash
npm run build
npm start
```

## SEO 優化特性
- 服務端渲染 (SSR)
- 增量靜態再生 (ISR)
- 結構化數據
- 自動生成站點地圖

## 貢獻指南
1. Fork 專案
2. 創建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m '新增某些特性'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 許可證
MIT 許可證