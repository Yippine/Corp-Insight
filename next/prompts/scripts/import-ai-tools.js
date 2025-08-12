#!/usr/bin/env node

/**
 * Import JSON docs from a directory into MongoDB collection `ai_tools`.
 * - Connects to: process.env.MONGODB_URI ||
 *   "mongodb://admin:password@localhost:27017/corp-insight?authSource=admin"
 * - Database name defaults to `corp-insight` unless overridden by env MONGODB_DB
 * - Each file contains one document in Extended JSON-like format using $oid/$date
 * - This script converts $oid/$date into native ObjectId/Date, then inserts
 * - Safe to re-run: duplicate key (_id) errors are skipped with a warning
 * - Usage:
 *   node import-ai-tools.js --dir=prompts/batches/0001
 *   node import-ai-tools.js --batch=2   # equals 0002
 *   node import-ai-tools.js --0023      # shorthand
 */

const fs = require('fs');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');

const scriptDir = __dirname;
const rootDir = path.resolve(scriptDir, '..');
let dataDir = path.resolve(rootDir, 'ai_tools_data');

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { dir: null, batch: null };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a.startsWith('--dir=')) out.dir = a.substring('--dir='.length);
    else if (a === '--dir' && args[i + 1]) { out.dir = args[i + 1]; i++; }
    else if (a.startsWith('--batch=')) out.batch = a.substring('--batch='.length);
    else if (/^--\d{1,4}$/.test(a)) out.batch = a.substring(2);
  }
  return out;
}

const DEFAULT_URI = 'mongodb://admin:password@localhost:27017/corp-insight?authSource=admin';
const MONGODB_URI = process.env.MONGODB_URI || DEFAULT_URI;
// Explicit db name to avoid ambiguity; can be overridden
const DEFAULT_DB_NAME = process.env.MONGODB_DB || 'corp-insight';

function readJsonText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function listJsonFiles(dir) {
  const results = [];
  function walk(current) {
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const ent of entries) {
      const full = path.join(current, ent.name);
      if (ent.isDirectory()) walk(full);
      else if (ent.isFile() && ent.name.toLowerCase().endsWith('.json')) results.push(full);
    }
  }
  walk(dir);
  return results.sort((a, b) => a.localeCompare(b));
}

/**
 * Recursively convert {$oid: string} -> ObjectId and {$date: string|number} -> Date
 */
function reviveExtendedJson(value) {
  if (Array.isArray(value)) {
    return value.map(item => reviveExtendedJson(item));
  }
  if (value && typeof value === 'object') {
    const keys = Object.keys(value);
    // Detect {$oid: '...'}
    if (keys.length === 1 && keys[0] === '$oid') {
      return new ObjectId(value.$oid);
    }
    // Detect {$date: '...'} or {$date: { $numberLong: '...' }}
    if (keys.length === 1 && keys[0] === '$date') {
      const d = value.$date;
      if (typeof d === 'string' || typeof d === 'number') {
        return new Date(d);
      }
      if (d && typeof d === 'object' && typeof d.$numberLong === 'string') {
        return new Date(Number(d.$numberLong));
      }
    }
    // Recurse into normal object
    const out = {};
    for (const k of keys) {
      out[k] = reviveExtendedJson(value[k]);
    }
    return out;
  }
  return value;
}

async function importAll() {
  const { dir, batch } = parseArgs();
  if (batch) {
    const padded = String(parseInt(batch, 10)).padStart(4, '0');
    dataDir = path.resolve(rootDir, 'batches', padded);
  } else if (dir) {
    dataDir = path.isAbsolute(dir) ? dir : path.resolve(rootDir, dir);
  } else {
    dataDir = path.resolve(rootDir, 'batches');
  }

  if (!fs.existsSync(dataDir)) {
    console.error(`Data directory not found: ${dataDir}`);
    process.exit(1);
  }
  const files = listJsonFiles(dataDir);
  if (files.length === 0) {
    console.error('No JSON files found to import.');
    process.exit(1);
  }

  console.log(`Connecting to ${MONGODB_URI}`);
  const client = new MongoClient(MONGODB_URI, { ignoreUndefined: true });
  await client.connect();
  try {
    const db = client.db(DEFAULT_DB_NAME);
    const collection = db.collection('ai_tools');

    let successCount = 0;
    let duplicateCount = 0;
    let errorCount = 0;

    for (const file of files) {
      const base = path.basename(file);
      try {
        const text = readJsonText(file);
        // Parse plain JSON first, then revive ($oid/$date)
        const raw = JSON.parse(text);
        const doc = reviveExtendedJson(raw);
        await collection.insertOne(doc);
        successCount += 1;
      } catch (err) {
        if (err && err.code === 11000) {
          duplicateCount += 1;
          console.warn(`[DUPLICATE KEY] ${base} skipped: ${err.message}`);
        } else {
          errorCount += 1;
          console.error(`[ERROR] ${base} failed:`, err.message || err);
        }
      }
    }

    console.log('Import finished.');
    console.log(`Inserted: ${successCount}`);
    console.log(`Duplicates skipped: ${duplicateCount}`);
    console.log(`Errors: ${errorCount}`);
  } finally {
    await client.close();
  }
}

if (require.main === module) {
  importAll().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
