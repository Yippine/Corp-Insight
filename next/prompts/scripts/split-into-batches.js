#!/usr/bin/env node

/**
 * Split prompts/ai_tools_data into batches of size N (default 10)
 * - Creates prompts/batches/0001, 0002, ...
 * - Each batch contains up to N JSON files (sorted by filename)
 * - Existing batches will be cleared and re-generated (be careful)
 */

const fs = require('fs');
const path = require('path');

const scriptDir = __dirname;
const rootDir = path.resolve(scriptDir, '..');
const dataDir = path.resolve(rootDir, 'ai_tools_data');
const batchesDir = path.resolve(rootDir, 'batches');

const BATCH_SIZE = Number(process.env.BATCH_SIZE || '10');

function ensureEmptyDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
  for (const name of fs.readdirSync(dir)) {
    fs.rmSync(path.join(dir, name), { recursive: true, force: true });
  }
}

function main() {
  if (!fs.existsSync(dataDir)) {
    console.error(`Data dir not found: ${dataDir}`);
    process.exit(1);
  }
  ensureEmptyDir(batchesDir);

  const files = fs
    .readdirSync(dataDir)
    .filter(n => n.toLowerCase().endsWith('.json'))
    .sort((a, b) => a.localeCompare(b));

  let batchIndex = 0;
  for (let i = 0; i < files.length; i += BATCH_SIZE) {
    const batchFiles = files.slice(i, i + BATCH_SIZE);
    batchIndex += 1;
    const batchName = String(batchIndex).padStart(4, '0');
    const outDir = path.join(batchesDir, batchName);
    fs.mkdirSync(outDir, { recursive: true });

    for (const f of batchFiles) {
      const src = path.join(dataDir, f);
      const dst = path.join(outDir, f);
      fs.copyFileSync(src, dst);
    }
  }

  console.log(`Created batches in ${batchesDir} with size ${BATCH_SIZE}`);
}

if (require.main === module) {
  main();
}
