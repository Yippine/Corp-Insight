/**
 * 頁面標題定義檔
 * 集中管理所有頁面的標題，便於統一修改和管理
 */

// 網站及各功能區塊基礎名稱
export const SITE_TITLE = '企業放大鏡™';
export const ENGLISH_TITLE = `Business Magnifier`;
export const COMPANY_TITLE = `企業資訊查詢`;
export const TENDER_TITLE = `標案資訊查詢`;
export const AI_TOOL_TITLE = `AI 助理生產力`;
export const FAQ_TITLE = `常見問題`;
export const PRIVACY_TITLE = `資料來源聲明`;
export const FEEDBACK_TITLE = `意見回饋`;

// 靜態標題定義
export const staticTitles = {
  // 佈局與首頁
  home: `${SITE_TITLE} | ${ENGLISH_TITLE}`,

  // 公司相關頁面
  companySearch: `${COMPANY_TITLE} | ${SITE_TITLE}`, // 預設企業搜尋頁標題
  companyNotFound: `查無此公司資料 | ${COMPANY_TITLE} | ${SITE_TITLE}`, // 公司詳情頁找不到對應公司

  // 標案相關頁面
  tenderSearch: `${TENDER_TITLE} | ${SITE_TITLE}`, // 預設標案搜尋頁標題
  tenderDetailError: `查無此標案資料 | ${TENDER_TITLE} | ${SITE_TITLE}`, // 標案詳情頁錯誤或查無資料

  // AI工具相關頁面
  aiToolSearch: `${AI_TOOL_TITLE} | ${SITE_TITLE}`, // 預設AI工具搜尋頁標題
  aiToolNotFound: `查無此 AI 助理 | ${AI_TOOL_TITLE} | ${SITE_TITLE}`, // AI工具詳情頁找不到對應工具

  // 其他頁面
  faq: `${FAQ_TITLE} | ${SITE_TITLE}`,
  privacy: `${PRIVACY_TITLE} | ${SITE_TITLE}`,
  feedback: `${FEEDBACK_TITLE} | ${SITE_TITLE}`,
};

// 動態標題函數
export const dynamicTitles = {
  // 公司搜尋
  companySearchResult: (query: string) =>
    `搜尋：「${query}」 | ${COMPANY_TITLE} | ${SITE_TITLE}`,
  companySearchNoResult: (query: string) =>
    `查無「${query}」資料 | ${COMPANY_TITLE} | ${SITE_TITLE}`,

  // 公司詳情
  companyDetail: (companyName: string) =>
    `${companyName} | ${COMPANY_TITLE} | ${SITE_TITLE}`,

  // 標案搜尋
  tenderSearchWithQueryAndType: (
    query: string,
    searchType: 'company' | 'tender'
  ) =>
    `${searchType === 'company' ? '廠商' : '標案'}：「${query}」 | ${TENDER_TITLE} | ${SITE_TITLE}`,
  tenderSearchNoResult: (query: string, searchType: 'company' | 'tender') =>
    `查無「${query}」${searchType === 'company' ? '廠商' : '標案'} | ${TENDER_TITLE} | ${SITE_TITLE}`,

  // 標案詳情
  tenderDetailWithName: (tenderName: string) =>
    `${tenderName} | ${TENDER_TITLE} | ${SITE_TITLE}`,

  // AI工具搜尋
  aiToolSearchWithQuery: (query: string) =>
    `搜尋：「${query}」 | ${AI_TOOL_TITLE} | ${SITE_TITLE}`,
  aiToolSearchWithTag: (tag: string) =>
    `類別：「${tag}」 | ${AI_TOOL_TITLE} | ${SITE_TITLE}`,
  aiToolSearchWithQueryAndTag: (query: string, tag: string) =>
    `搜尋：「${query}」、類別：「${tag}」 | ${AI_TOOL_TITLE} | ${SITE_TITLE}`,
  aiToolSearchNoResult: (query?: string, tag?: string) => {
    let searchTerm = '';
    if (query) searchTerm += `「${query}」關鍵字`;
    if (tag) searchTerm += `${tag ? '、' : ''}「${tag}」類別`;
    return searchTerm
      ? `查無${searchTerm} | ${AI_TOOL_TITLE} | ${SITE_TITLE}`
      : `查無 AI 助理 | ${AI_TOOL_TITLE} | ${SITE_TITLE}`;
  },

  // AI工具詳情
  aiToolDetail: (toolName: string) =>
    `${toolName} | ${AI_TOOL_TITLE} | ${SITE_TITLE}`,
};

// 為了向後兼容，提供一個生成標題的輔助函數
export function generatePageTitle(base: string, suffix: string): string {
  return suffix
    ? `${base} | ${suffix} | ${SITE_TITLE}`
    : `${base} | ${SITE_TITLE}`;
}
