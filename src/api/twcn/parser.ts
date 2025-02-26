import * as cheerio from 'cheerio';

export interface ListedCompanyData {
  財報資訊: {
    // 基本資訊
    市場別: string;
    代號: string;
    簡稱: string;
    英文簡稱: string;
    英文地址: string;
    電話: string;
    傳真: string;
    EMail: string;
    網址: string;
    
    // 管理階層
    董事長: string;
    總經理: string;
    發言人: string;
    發言人職稱: string;
    代理發言人: string;
    
    // 重要日期
    成立日期: string;
    上市日期: string;
    
    // 股票資訊
    普通股每股面額: string;
    實收資本額: string;
    私募股數: string;
    特別股: string;
    
    // 其他資訊
    股票過戶機構: string;
    過戶電話: string;
    過戶地址: string;
    簽證會計師事務所: string;
    簽證會計師1: string;
    簽證會計師2: string;
  }
}

export const parseTwcnHtml = (html: string): ListedCompanyData => {
  const $ = cheerio.load(html);

  // 從表格中獲取特定欄位值的輔助函數
  const getFieldValue = (fieldName: string): string => {
    const row = $(`td:contains("${fieldName}")`).parent('tr');
    if (!row.length) return '未提供';

    const value = row.find('td').eq(1).text().trim();
    return value || '未提供';
  };

  // 格式化數字
  const formatNumber = (value: string): string => {
    if (!value || value === '未提供') return '0';
    return value.replace(/[^\d.-]/g, '');
  };

  // 格式化日期
  const formatDate = (value: string): string => {
    if (!value || value === '未提供') return '未提供';
    const year = value.substring(0, 4);
    const month = value.substring(4, 6);
    const day = value.substring(6, 8);
    return `${year}/${month}/${day}`;
  };

  // 清理文本內容
  const cleanText = (value: string): string => {
    if (!value || value === '未提供') return '未提供';
    return value
      .replace(/[\n\r]+/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/\[.*?\]/g, '')
      .trim();
  };

  const data: ListedCompanyData = {
    財報資訊: {
      市場別: cleanText(getFieldValue('市場別')),
      代號: cleanText(getFieldValue('代號')),
      簡稱: cleanText(getFieldValue('簡稱')),
      英文簡稱: cleanText(getFieldValue('英文簡稱')),
      英文地址: cleanText(getFieldValue('英文地址')),
      電話: cleanText(getFieldValue('電話')),
      傳真: cleanText(getFieldValue('傳真')),
      EMail: cleanText(getFieldValue('EMail')),
      網址: cleanText(getFieldValue('網址')),
      董事長: cleanText(getFieldValue('董事長')),
      總經理: cleanText(getFieldValue('總經理')),
      發言人: cleanText(getFieldValue('發言人')),
      發言人職稱: cleanText(getFieldValue('發言人職稱')),
      代理發言人: cleanText(getFieldValue('代理發言人')),
      成立日期: formatDate(getFieldValue('成立日期')),
      上市日期: formatDate(getFieldValue('上市日期')),
      普通股每股面額: cleanText(getFieldValue('普通股每股面額')),
      實收資本額: formatNumber(getFieldValue('實收資本額')),
      私募股數: formatNumber(getFieldValue('私募股數')),
      特別股: formatNumber(getFieldValue('特別股')),
      股票過戶機構: cleanText(getFieldValue('股票過戶機構')),
      過戶電話: cleanText(getFieldValue('過戶電話')),
      過戶地址: cleanText(getFieldValue('過戶地址')),
      簽證會計師事務所: cleanText(getFieldValue('簽證會計師事務所')),
      簽證會計師1: cleanText(getFieldValue('簽證會計師1')),
      簽證會計師2: cleanText(getFieldValue('簽證會計師2'))
    }
  };

  return data;
};