#!/usr/bin/env node

/**
 * List distinct tags and their counts from ai_tools collection.
 * - Connects to MONGODB_URI or default local dev URI
 * - Options via CLI:
 *   --active=true     Only count documents where isActive=true
 *   --limit=50        Limit the number of tags shown (by count desc)
 *   --db=corp-insight Override db name (if URI lacks db)
 */

const { MongoClient } = require('mongodb');

const DEFAULT_URI =
  process.env.MONGODB_URI ||
  'mongodb://admin:password@localhost:27017/corp-insight?authSource=admin';
const DEFAULT_DB = process.env.MONGODB_DB || 'corp-insight';

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { active: true, limit: 200, db: DEFAULT_DB };
  for (const a of args) {
    if (a.startsWith('--active=')) out.active = a.split('=')[1] === 'true';
    else if (a.startsWith('--limit=')) out.limit = Number(a.split('=')[1] || '200');
    else if (a.startsWith('--db=')) out.db = a.split('=')[1] || DEFAULT_DB;
  }
  return out;
}

async function main() {
  const { active, limit, db } = parseArgs();
  const client = new MongoClient(DEFAULT_URI);
  await client.connect();
  try {
    const database = client.db(db);
    const col = database.collection('ai_tools');

    const pipeline = [
      { $match: active ? { tags: { $exists: true }, isActive: true } : { tags: { $exists: true } } },
      { $unwind: '$tags' },
      { $project: { tag: { $trim: { input: '$tags' } } } },
      { $group: { _id: '$tag', count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
      { $limit: limit },
    ];

    const docs = await col.aggregate(pipeline).toArray();
    const distinct = docs.map(d => d._id);

    const result = {
      uri: DEFAULT_URI,
      activeOnly: active,
      totalDistinct: distinct.length,
      tags: docs,
    };
    console.log(JSON.stringify(result, null, 2));
  } finally {
    await client.close();
  }
}

if (require.main === module) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
