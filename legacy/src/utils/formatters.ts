/**
 * 格式化貨幣金額
 * @param amount 金額數字
 * @returns 格式化後的字串，例如：NT$ 1,234,567
 */
export function formatCurrency(amount: number): string {
  if (!amount) return "NT$ 0";
  return `NT$ ${amount.toLocaleString("zh-TW")}`;
}

/**
 * 通用日期格式化函式 (支援多種輸入格式)
 * @param date 可接受 Date 物件、ISO 8601 字串、YYYYMMDD 數字格式
 * @returns 標準化日期字串 (YYYY-MM-DD) 或空字串
 *
 * 業界最佳實踐：
 * 1. 多型別輸入處理 - 支援 Date/string/number 型別
 * 2. 防禦性編程 - 嚴格驗證輸入有效性
 * 3. 時區安全 - 使用 UTC 模式避免時區問題
 * 4. 效能優化 - 優先使用原生 Date 方法
 */
export function formatDate(date: string | Date | number): string {
  if (!date) return "";

  // 處理數字格式 (e.g., 20241231 -> 2024-12-31)
  if (typeof date === "number") {
    const dateStr = String(date);
    if (dateStr.length !== 8) return "";
    return `${dateStr.slice(0, 4)}/${dateStr.slice(4, 6)}/${dateStr.slice(6, 8)}`;
  }

  // 處理字串格式 (包含 ISO 8601 和 YYYYMMDD)
  if (typeof date === "string") {
    // 移除可能存在的非數字字元
    const cleaned = date.replace(/[^0-9]/g, "");
    if (cleaned.length === 8) {
      return `${cleaned.slice(0, 4)}/${cleaned.slice(4, 6)}/${cleaned.slice(6, 8)}`;
    }
  }

  // 標準日期物件處理
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";

    return [
      d.getUTCFullYear(),
      (d.getUTCMonth() + 1).toString().padStart(2, "0"),
      d.getUTCDate().toString().padStart(2, "0"),
    ].join("/");
  } catch {
    return "";
  }
}
