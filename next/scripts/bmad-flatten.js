#!/usr/bin/env node
/**
 * BMAD Method Flattener Script
 * 產生扁平化的程式碼結構檔案，用於 AI 分析
 *
 * 使用方法：
 * # 基本使用：在專案根目錄產生 flattened-codebase.xml
 * npm run flatten
 *
 * # 自訂輸入路徑
 * npm run flatten -- --input=./src
 *
 * # 自訂輸出檔案
 * npm run flatten -- --output=./custom-output.xml
 *
 * # 同時自訂輸入和輸出
 * npm run flatten -- --input=./src --output=./src-only.xml
 */

const path = require('node:path');
const fs = require('fs-extra');

// Simple arg parsing: --input / --output
const argv = process.argv.slice(2);
function getArg(name, short) {
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === `--${name}` && argv[i + 1]) return argv[i + 1];
    if (short && argv[i] === `-${short}` && argv[i + 1]) return argv[i + 1];
    if (argv[i].startsWith(`--${name}=`)) return argv[i].split('=')[1];
  }
  return undefined;
}

(async () => {
  try {
    const inputDir = path.resolve(getArg('input', 'i') || process.cwd());
    const outputPath = path.resolve(
      getArg('output', 'o') || path.join(inputDir, 'flattened-codebase.xml')
    );

    const {
      discoverFiles,
      filterFiles,
      aggregateFileContents,
    } = require('../node_modules/bmad-method/tools/flattener/files.js');

    const {
      generateXMLOutput,
    } = require('../node_modules/bmad-method/tools/flattener/xml.js');

    console.log(`Flattening from: ${inputDir}`);
    console.log(`Writing to: ${outputPath}`);

    const discovered = await discoverFiles(inputDir);
    const filtered = await filterFiles(discovered, inputDir);
    console.log(`Including ${filtered.length} files`);

    const aggregated = await aggregateFileContents(filtered, inputDir, null);

    await fs.ensureDir(path.dirname(outputPath));
    await generateXMLOutput(aggregated, outputPath);

    const stats = await fs.stat(outputPath);
    console.log(`✅ WROTE ${outputPath} (${stats.size} bytes)`);
  } catch (err) {
    console.error('ERROR:', err && err.stack ? err.stack : err);
    process.exitCode = 2;
  }
})();
