/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // 禁用靜態優化以解決動態 API 路由問題
  staticPageGenerationTimeout: 180,
  // 禁用生成靜態頁面導出，解決 API 路由中使用 searchParams 的問題
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 配置禁用靜態生成的頁面
  exportPathMap: async function() {
    return {
      '/api/company/twincn': { page: '/api/company/twincn', dynamic: true },
    };
  }
}

module.exports = nextConfig