import cron from 'node-cron';
import { exec } from 'child_process';

// 每天凌晨 2 點更新 sitemap
cron.schedule('0 2 * * *', () => {
  exec('node scripts/generate-sitemap.js', (error, stdout, stderr) => {
    if (error) {
      console.error(`Sitemap generation error: ${error}`);
      return;
    }
    console.log('Sitemap updated successfully');
  });
});