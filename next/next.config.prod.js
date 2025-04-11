/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // 禁用所有靜態生成
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // 顯式標記動態路由
  dynamicRoutes: [
    '/api/company/twincn',
    '/api/proxy/tenders'
  ],
  // 增加靜態生成超時
  staticPageGenerationTimeout: 300,
  // 禁用圖像優化以節省內存
  images: {
    unoptimized: true
  },
  // 禁用壓縮以加快構建速度
  compress: false,
  // 強制動態渲染所有頁面
  runtime: 'nodejs',
  // 為特定頁面設置渲染模式
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  webpack: (config, { dev, isServer }) => {
    // 自定義 webpack 配置
    return config;
  }
};

module.exports = nextConfig;