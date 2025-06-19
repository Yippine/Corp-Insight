#!/usr/bin/env node

require('dotenv').config({ path: './.env.local' });
const mongoose = require('mongoose');

// 顏色輸出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

async function listCollections() {
  console.log(colorize('\n📜 Listing all collections in the database...', 'bright'));
  console.log(colorize('='.repeat(50), 'cyan'));

  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    console.error(colorize('❌ Error: MONGODB_URI is not defined in your .env.local file.', 'red'));
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // 5 seconds timeout
    });
    console.log(colorize('✅ Successfully connected to MongoDB.', 'green'));

    const collections = await mongoose.connection.db.listCollections().toArray();

    if (collections.length === 0) {
      console.log(colorize('📂 No collections found in the database.', 'yellow'));
    } else {
      console.log(colorize(`\nFound ${collections.length} collections:`, 'green'));
      collections.forEach(collection => {
        console.log(`  - ${colorize(collection.name, 'yellow')}`);
      });
    }

  } catch (error) {
    console.error(colorize(`\n❌ Could not connect to MongoDB or list collections.`, 'red'));
    console.error(colorize(`Error: ${error.message}`, 'red'));
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log(colorize('\n🔌 Connection to MongoDB closed.', 'green'));
  }
}

listCollections();