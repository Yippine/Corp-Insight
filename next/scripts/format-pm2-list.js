const { exec } = require('child_process');

// --- format-pm2-list.js ---
// 本腳本執行 `pm2 jlist`，取得原始的 JSON 格式程序數據，
// 然後將其格式化為一個乾淨、對齊、保證在任何終端環境下都不會出現亂碼的純文字 ASCII 表格。
// 這是為了解決在 Windows 透過 SSM/SSH 連線到 Linux EC2 時，`pm2 list` 會出現亂碼的頑固問題。

/**
 * 將記憶體大小從 bytes 轉換為可讀的 MB 格式
 * @param {number} bytes - 記憶體大小 (bytes)
 * @returns {string} - 格式化後的記憶體字串
 */
const formatMemory = (bytes) => {
  if (bytes === 0) return '0 B';
  const megabytes = bytes / (1024 * 1024);
  return `${megabytes.toFixed(1)}mb`;
};

/**
 * 建立一個帶有 padding 的表格列
 * @param {string[]} columns - 該列的所有欄位內容
 * @param {number[]} widths - 每個欄位的目標寬度
 * @returns {string} - 格式化後的單列字串
 */
const createRow = (columns, widths) => {
  return columns
    .map((col, i) => String(col).padEnd(widths[i]))
    .join('  ');
};

// 執行 `pm2 jlist` 來取得原始 JSON 數據
exec('pm2 jlist', (error, stdout, stderr) => {
  if (error) {
    console.error(`🔴 執行 'pm2 jlist' 時發生錯誤: ${error.message}`);
    if (stderr) {
      console.error(`stderr: ${stderr}`);
    }
    return;
  }

  try {
    const processes = JSON.parse(stdout);
    if (!Array.isArray(processes) || processes.length === 0) {
      console.log('✅ 目前沒有由 pm2 管理的程序。');
      return;
    }

    // 提取並格式化我們關心的數據
    const data = processes.map(proc => ({
      id: proc.pm_id,
      name: proc.name,
      mode: proc.pm2_env?.exec_mode.replace('_mode', '') || 'N/A',
      status: proc.pm2_env?.status || 'N/A',
      cpu: `${proc.monit?.cpu || 0}%`,
      memory: formatMemory(proc.monit?.memory || 0),
    }));

    const headers = ['id', 'name', 'mode', 'status', 'cpu', 'memory'];
    
    // 計算每個欄位的最大寬度，以便進行對齊
    const widths = headers.map(h => h.length);
    data.forEach(row => {
      headers.forEach((h, i) => {
        const valueLength = String(row[h]).length;
        if (valueLength > widths[i]) {
          widths[i] = valueLength;
        }
      });
    });

    // 輸出 ASCII 表格
    console.log(`✅ 成功取得 pm2 程序列表：`);
    console.log(createRow(headers, widths));
    console.log(createRow(headers.map((h, i) => '-'.repeat(widths[i])), widths)); // 分隔線
    data.forEach(row => {
      const rowValues = headers.map(h => row[h]);
      console.log(createRow(rowValues, widths));
    });

  } catch (parseError) {
    console.error('🔴 解析 pm2 的 JSON 輸出失敗。', parseError);
    console.log('--- pm2 jlist 的原始輸出 ---');
    console.log(stdout);
  }
});