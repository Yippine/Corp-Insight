#!/usr/bin/env node

/**
 * Generate skeleton ai_tools documents for all entries.
 * - Reads all .md files from ../entries
 * - For each file, creates a JSON document with fixed/scriptable fields filled:
 *   _id ($oid), category, isActive, createdAt/updatedAt ($date),
 *   promptTemplate.prefix (fixed), promptTemplate.suffix (file content with \n escapes)
 * - Leaves human-authored fields (id, name, description, tags, instructions, placeholder) empty for later fill
 * - Writes output JSON files into ../ai_tools_data with the same basename + .json
 */

const fs = require('fs');
const path = require('path');

const scriptDir = __dirname;
const rootDir = path.resolve(scriptDir, '..');
const entriesDir = path.resolve(rootDir, 'entries');
const outDir = path.resolve(rootDir, 'ai_tools_data');

const FIXED_PREFIX = '你已經是經營這個領域幾十年的專家。請透過大量的官方網站或網路資訊，為我查詢這項最推薦的具體步驟指引。請直接告訴我最簡單、最有效、最系統和最全面的解答，以及你的心路歷程。';

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function toMongoExtendedObjectId() {
  // Generate a 24-hex string ObjectId-like value
  const hex = [...cryptoRandomBytes(12)].map(b => b.toString(16).padStart(2, '0')).join('');
  return { $oid: hex };
}

function cryptoRandomBytes(n) {
  // Prefer crypto if available
  try {
    const crypto = require('crypto');
    return crypto.randomBytes(n);
  } catch {
    // Fallback (not cryptographically strong) but sufficient for local generation
    const buf = Buffer.alloc(n);
    for (let i = 0; i < n; i++) buf[i] = Math.floor(Math.random() * 256);
    return buf;
  }
}

function toMongoExtendedDate(date) {
  return { $date: date.toISOString() };
}

function readMarkdown(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  return raw;
}

function escapeForJsonStringMultiline(text) {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\r\n|\n|\r/g, '\\n')
    .replace(/\t/g, '\\t')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

function buildDocumentFromEntry(mdContent) {
  const now = new Date();
  return {
    _id: toMongoExtendedObjectId(),
    id: '',
    name: '',
    description: '',
    tags: [],
    instructions: {
      what: '',
      why: '',
      how: ''
    },
    placeholder: '',
    promptTemplate: {
      prefix: FIXED_PREFIX,
      suffix: escapeForJsonStringMultiline(mdContent)
    },
    category: 'AI 工具',
    isActive: true,
    createdAt: toMongoExtendedDate(now),
    updatedAt: toMongoExtendedDate(now)
  };
}

function getAllEntryFiles(dir) {
  return fs
    .readdirSync(dir)
    .filter(name => name.toLowerCase().endsWith('.md'))
    .map(name => path.join(dir, name))
    .sort();
}

function writeJsonPretty(filePath, data) {
  const json = JSON.stringify(data, null, 2);
  fs.writeFileSync(filePath, json + '\n', 'utf8');
}

function main() {
  ensureDir(outDir);
  if (!fs.existsSync(entriesDir)) {
    console.error(`Entries directory not found: ${entriesDir}`);
    process.exit(1);
  }

  const files = getAllEntryFiles(entriesDir);
  if (files.length === 0) {
    console.error('No entry files found.');
    process.exit(1);
  }

  let count = 0;
  for (const file of files) {
    const md = readMarkdown(file);
    const doc = buildDocumentFromEntry(md);
    const base = path.basename(file, path.extname(file));
    const outPath = path.join(outDir, `${base}.json`);
    writeJsonPretty(outPath, doc);
    count += 1;
  }

  console.log(`Generated ${count} documents into ${outDir}`);
}

if (require.main === module) {
  main();
}
