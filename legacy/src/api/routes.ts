import { parseTwcnHtml } from './twcn/parser';

export const fetchListedCompany = async (taxId: string) => {
  try {
    const response = await fetch(`/api/proxy/twincn?no=${taxId}`);
    const html = await response.text();
    return parseTwcnHtml(html);
  } catch (error) {
    console.error('上市櫃資料取得失敗：', error);
    return null;
  }
};