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
  return host.includes('aitools.leopilot.com') || host.includes('localhost');
}

// 生成 AI Tools URL
export function getAiToolsUrl(path: string, originalHost?: string): string {
  // 確保路徑以 / 開頭
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  // 如果已經在 aitools 域名下，返回相對路徑
  if (isAiToolsDomain(originalHost)) {
    return normalizedPath;
  }

  // 否則返回完整的 aitools 域名 URL
  return `${SITE_CONFIG.aitools.domain}${normalizedPath}`;
}

// 生成主站 URL
export function getMainSiteUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_CONFIG.main.domain}${normalizedPath}`;
}