#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 檢查 critters 依賴問題...');

// 檢查 package.json 中的 critters 版本
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

const crittersVersion = packageJson.dependencies?.critters;
console.log(`📦 當前 critters 版本: ${crittersVersion}`);

// 檢查 node_modules 中是否存在 critters
const crittersPath = path.join(__dirname, '..', 'node_modules', 'critters');
const crittersExists = fs.existsSync(crittersPath);

console.log(`📁 critters 模塊存在: ${crittersExists ? '✅' : '❌'}`);

if (crittersExists) {
  try {
    const crittersPackageJson = JSON.parse(
      fs.readFileSync(path.join(crittersPath, 'package.json'), 'utf8')
    );
    console.log(`🔖 已安裝的 critters 版本: ${crittersPackageJson.version}`);
  } catch (error) {
    console.log('❌ 無法讀取 critters 版本資訊');
  }
}

// 檢查 Next.js 配置
const nextConfigPath = path.join(__dirname, '..', 'next.config.js');
if (fs.existsSync(nextConfigPath)) {
  const nextConfig = fs.readFileSync(nextConfigPath, 'utf8');
  const hasOptimizeCss = nextConfig.includes('optimizeCss');
  console.log(`⚙️  Next.js optimizeCss 配置: ${hasOptimizeCss ? '✅' : '❌'}`);
  
  if (hasOptimizeCss && nextConfig.includes('optimizeCss: true')) {
    console.log('⚠️  警告: optimizeCss 在所有環境中都啟用，這可能在開發環境中導致問題');
  }
}

// 提供解決方案建議
console.log('\n🛠️  建議解決方案:');
console.log('1. 重新安裝依賴: npm ci');
console.log('2. 清理緩存: npm cache clean --force');
console.log('3. 重建 Docker 映像: docker-compose build app-dev');
console.log('4. 確保 Next.js 配置只在生產環境啟用 CSS 優化');

// 檢查環境變數
console.log('\n🌍 環境變數檢查:');
console.log(`NODE_ENV: ${process.env.NODE_ENV || '未設定'}`);
console.log(`NEXT_TELEMETRY_DISABLED: ${process.env.NEXT_TELEMETRY_DISABLED || '未設定'}`);