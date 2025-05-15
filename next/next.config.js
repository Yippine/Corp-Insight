/** @type {import('next').NextConfig} */
const nextConfig = {
  // 禁用靜態優化以解決動態 API 路由問題
  staticPageGenerationTimeout: 180,
  // 禁用生成靜態頁面導出，解決 API 路由中使用 searchParams 的問題
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 添加性能優化選項
  reactStrictMode: false, // 關閉嚴格模式可以減少開發環境中的雙重渲染
  swcMinify: true, // 使用 SWC 進行代碼壓縮
  compiler: {
    removeConsole: process.env.NODE_ENV === "production", // 生產環境移除 console
  },
  images: {
    domains: ['company.g0v.ronny.tw'], // 允許外部圖片域名
    unoptimized: process.env.NODE_ENV === "development", // 開發環境不優化圖片以加快構建
  },
  experimental: {
    scrollRestoration: true, // 允許頁面滾動位置保存
  },
  // 添加 CORS 配置
  async headers() {
    return [
      {
        // 應用於所有 API 路由
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" }, // 生產環境下應更改為特定域名
          { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,DELETE,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization" },
        ]
      },
      {
        // 應用於根路由
        source: "/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
        ]
      }
    ]
  }
}

module.exports = nextConfig