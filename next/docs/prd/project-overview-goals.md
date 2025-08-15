# 專案摘要與目標

目標：於既有企業洞察平台內（Brownfield）新增「第三方登入（Google → Facebook, Line）與會員管理系統」，整合 Payload CMS 作為後台內容/會員資料管理介面、使用 NextAuth.js 處理 OAuth 與本地登入，沿用現有 MongoDB（Docker 化）與 JWT 機制，最小侵入現有程式碼，採迭代方式以 PoC → MVP → 擴充。

## 成功指標（KPI）

- Google 第三方登入完成並穩定運作（POC 阶段）：功能正確率 ≥ 98%（回調 / 驗證流程）
- Email 驗證信啟用：註冊後完成驗證率 ≥ 95%
- Admin 後台能列出會員、搜尋、禁用/啟用帳號並查看登入記錄
- 後台能啟動/檢視 MongoDB 備份/還原（需權限控管與操作審核）
- CI/CD / 部署：容器化支援，與現有 Dockerfile/docker-compose 相容

## 範圍（MVP）

- Google OAuth + Email/密碼註冊與驗證信、忘記密碼
- Payload CMS 作為 Admin 介面（整合 users collection 與 provider 綁定）
- NextAuth.js 作為認證中介，發放 access JWT（短期）與 server-side refresh token（儲存在 DB）
- 後台會員儀表板（基礎統計）與 /admin/sitemap、/admin/database 類似的控制頁面（列入風險提示與按鈕慎權）
- 符合你專案現有發信機制（參考 /feedback 使用相同工具與環境變數）

## 技術棧要求

- **核心技術：** Payload CMS + NextAuth.js
- **授權要求：** 所有額外套件採用 MIT 或 Apache-2.0 授權之開源軟體
- **語言要求：** 繁體中文（臺灣用語）
- **專案類型：** Brownfield 增強（最小侵入現有系統）
- **開發方法：** PoC → MVP → 迭代擴充

---

**相關文件：**
- [技術限制與前提](./technical-constraints.md)
- [開發優先順序](./development-priorities.md)
- [風險緩解策略](./risk-mitigation.md)