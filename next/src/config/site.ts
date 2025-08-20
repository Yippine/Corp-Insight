export const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

// 環境檢測函式
function getEnvironmentType(): 'dev-local' | 'prod-local' | 'prod-production' {
  if (process.env.NODE_ENV === 'development') {
    return 'dev-local'; // 開發環境 dev docker
  }
  if (process.env.NEXT_PUBLIC_IS_LOCAL_PROD === 'true') {
    return 'prod-local'; // 開發環境 prod docker
  }
  return 'prod-production'; // 正式環境 prod docker
}

// 檢測是否為本地測試環境（向後兼容）
function isLocalEnvironment(): boolean {
  const env = getEnvironmentType();
  return env === 'dev-local' || env === 'prod-local';
}

// 多域名配置系統
export const SITE_CONFIG = {
  main: {
    domain:
      process.env.NEXT_PUBLIC_SITE_URL || 'https://corpinsight.leopilot.com',
    name: 'Corp Insight',
  },
  aitools: {
    domain:
      process.env.NEXT_PUBLIC_AITOOLS_URL || 'https://aitools.leopilot.com',
    name: 'AI Tools',
  },
};

// 檢測是否為 AI Tools 域名
export function isAiToolsDomain(host?: string): boolean {
  if (!host) return false;

  // 本地環境不進行域名檢測
  if (isLocalEnvironment()) {
    return false;
  }

  // 生產環境檢查 aitools 域名
  return host.includes('aitools.leopilot.com');
}

// 統一的 URL 生成器 - 所有導航都應該使用這個
export function generateUrl(
  type: 'aitools' | 'company' | 'tender' | 'universal',
  path: string,
  currentHost?: string
): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const env = getEnvironmentType();

  switch (env) {
    case 'dev-local':
      // 🏠 開發環境 dev docker - 網域和路由都不變
      switch (type) {
        case 'aitools':
          // 保持 /aitool 前綴
          if (normalizedPath.startsWith('/aitool')) {
            return normalizedPath;
          }
          return `/aitool${normalizedPath}`;
        default:
          return normalizedPath;
      }

    case 'prod-local':
      // 🔧 開發環境 prod docker - 網域不變，路由轉換
      switch (type) {
        case 'aitools':
          // 轉換為不帶前綴的路徑：/aitool/search -> /search
          if (normalizedPath.startsWith('/aitool/')) {
            return normalizedPath.replace('/aitool', '');
          }
          // 如果已經是正確格式，直接返回
          return normalizedPath;
        default:
          return normalizedPath;
      }

    case 'prod-production':
      // 🌐 正式環境 prod docker - 網域會變，路由也會變
      const isOnAiTools = isAiToolsDomain(currentHost);

      switch (type) {
        case 'aitools':
          // AI 工具相關路由
          if (isOnAiTools) {
            // 已在 aitools 域名，返回轉換後的路徑
            if (normalizedPath.startsWith('/aitool/')) {
              return normalizedPath.replace('/aitool', '');
            }
            return normalizedPath;
          }
          // 需要跳轉到 aitools 域名，路徑要轉換
          const convertedPath = normalizedPath.startsWith('/aitool/')
            ? normalizedPath.replace('/aitool', '')
            : normalizedPath;
          return `${SITE_CONFIG.aitools.domain}${convertedPath}`;

        case 'company':
        case 'tender':
          // 企業/標案相關路由
          if (isOnAiTools) {
            // 在 aitools 域名，需要跳回主站
            return `${SITE_CONFIG.main.domain}${normalizedPath}`;
          }
          // 已在主站，返回相對路徑
          return normalizedPath;

        case 'universal':
          // 通用頁面（隱私、FAQ、意見回饋等），保持當前域名
          return normalizedPath;

        default:
          return normalizedPath;
      }

    default:
      return normalizedPath;
  }
}

// 向後兼容的函式（逐步淘汰）
export function getAiToolsUrl(path: string, originalHost?: string): string {
  return generateUrl('aitools', path, originalHost);
}

// 生成主站 URL
export function getMainSiteUrl(path: string): string {
  // 本地環境直接返回路徑
  if (isLocalEnvironment()) {
    return path.startsWith('/') ? path : `/${path}`;
  }
  // 生產環境返回完整 URL
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_CONFIG.main.domain}${normalizedPath}`;
}
