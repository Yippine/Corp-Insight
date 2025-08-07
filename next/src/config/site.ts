export const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

// 多域名配置系統
export const SITE_CONFIG = {
  main: {
    domain: process.env.NEXT_PUBLIC_SITE_URL || 'https://corpinsight.leopilot.com',
    name: 'Corp Insight'
  },
  aitools: {
    domain: process.env.NEXT_PUBLIC_AITOOLS_URL || 'https://aitools.leopilot.com',
    name: 'AI Tools'
  }
};

// 檢測是否為 AI Tools 域名
export function isAiToolsDomain(host?: string): boolean {
  if (!host) return false;
  
  // 在開發環境中，不進行域名重定向
  const isDevelopment = process.env.NODE_ENV === 'development';
  if (isDevelopment) {
    return false; // 開發環境永遠返回 false，避免重定向循環
  }
  
  // 生產環境只檢查 aitools 域名
  return host.includes('aitools.leopilot.com');
}

// 生成 AI Tools URL
export function getAiToolsUrl(path: string, originalHost?: string): string {
  // 確保路徑以 / 開頭
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // 在開發環境中，使用 /aitool 前綴
  const isDevelopment = process.env.NODE_ENV === 'development';
  if (isDevelopment) {
    // 如果路徑已經有 /aitool 前綴，直接返回
    if (normalizedPath.startsWith('/aitool')) {
      return normalizedPath;
    }
    // 否則添加 /aitool 前綴
    return `/aitool${normalizedPath}`;
  }

  // 生產環境：如果已經在 aitools 域名下，返回相對路徑
  if (isAiToolsDomain(originalHost)) {
    return normalizedPath;
  }

  // 生產環境：返回完整的 aitools 域名 URL
  return `${SITE_CONFIG.aitools.domain}${normalizedPath}`;
}

// 生成主站 URL
export function getMainSiteUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_CONFIG.main.domain}${normalizedPath}`;
}
