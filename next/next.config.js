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
    removeConsole: process.env.NODE_ENV === 'production', // 生產環境移除 console
  },
  images: {
    domains: ['company.g0v.ronny.tw'], // 允許外部圖片域名
    unoptimized: process.env.NODE_ENV === 'development', // 開發環境不優化圖片以加快構建
  },
  poweredByHeader: false, // 移除X-Powered-By頭
  // 優化頁面載入方式
  distDir: '.next', // 指定構建輸出目錄
  generateEtags: true, // 生成ETag頭提高客戶端緩存效率
  compress: true, // 啟用gzip壓縮
  productionBrowserSourceMaps: false, // 生產環境不生成source maps以減小文件大小
  // 配置永久靜態重定向，避免伺服器端重定向的效能問題
  async redirects() {
    return [
      {
        source: '/',
        destination: '/company/search',
        permanent: true, // 使用 308 永久重定向
      },
    ];
  },
  experimental: {
    optimizeCss: true, // 優化CSS
    scrollRestoration: true, // 允許頁面滾動位置保存
    optimisticClientCache: true, // 啟用樂觀客戶端緩存
    serverMinification: true, // 伺服器組件代碼最小化
    serverActions: {
      bodySizeLimit: '2mb', // 提高限制以處理較大的請求
    },
    forceSwcTransforms: true, // 強制使用SWC轉換
    swcPlugins: [], // 支持SWC插件
    appDir: true,
  },
  // 添加 CORS 配置
  async headers() {
    return [
      {
        // 應用於所有 API 路由
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' }, // 生產環境下應更改為特定域名
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,POST,PUT,DELETE,OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value:
              'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
          },
        ],
      },
      {
        // 應用於根路由
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          // 添加緩存控制以提高性能
          { key: 'Cache-Control', value: 'public, max-age=3600' }, // 1小時緩存
          // 添加安全頭
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  output: 'standalone',
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    GOOGLE_AI_API_KEY: process.env.GOOGLE_AI_API_KEY,
  },
  webpack: (config, { isServer }) => {
    // 處理伺服器端 MongoDB 相關模組
    if (isServer) {
      config.externals.push({
        'utf-8-validate': 'commonjs utf-8-validate',
        bufferutil: 'commonjs bufferutil',
        mongodb: 'commonjs mongodb',
        mongoose: 'commonjs mongoose',
      });
    } else {
      // 客戶端 fallback 配置 - 解決 MongoDB 驅動程式的 Node.js 模組問題
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        dns: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
        querystring: false,
        util: false,
        buffer: false,
        events: false,
        child_process: false,
        cluster: false,
        dgram: false,
        module: false,
        perf_hooks: false,
        readline: false,
        repl: false,
        worker_threads: false,
        inspector: false,
        'mongodb-client-encryption': false,
      };

      // 忽略 MongoDB 相關模組在客戶端的載入
      config.externals = config.externals || [];
      config.externals.push({
        mongodb: 'mongodb',
        mongoose: 'mongoose',
        'mongodb-client-encryption': 'mongodb-client-encryption',
      });

      // 添加 IgnorePlugin 來忽略特定模組
      const webpack = require('webpack');
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^(mongodb|mongoose|mongodb-client-encryption)$/,
        })
      );
    }

    return config;
  },
  ...(process.env.NODE_ENV === 'development' && {
    reactStrictMode: true,
  }),
  ...(process.env.NODE_ENV === 'production' && {
    swcMinify: true,
    compiler: {
      removeConsole: {
        exclude: ['error'],
      },
    },
  }),
};

module.exports = nextConfig;
