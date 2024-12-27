/**
 * 格式化貨幣金額
 * @param amount 金額數字
 * @returns 格式化後的字串，例如：NT$ 1,234,567
 */
export function formatCurrency(amount: number): string {
  if (!amount) return 'NT$ 0';
  return `NT$ ${amount.toLocaleString('zh-TW')}`;
}

/**
 * 格式化日期
 * @param date 日期字串或 Date 物件
 * @returns 格式化後的字串，例如：2024-01-01
 */
export function formatDate(date: string | Date): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\//g, '-');
}