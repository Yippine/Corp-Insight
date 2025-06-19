#!/usr/bin/env node
/**
 * Business Magnifier MongoDB Collections 初始化腳本
 * 
 * 用途: 根據專案架構規則重建所有必要的 MongoDB Collections 和索引
 * 執行方式: node scripts/init-mongodb-collections.js
 * 
 * 重建的 7 個 Collections:
 * 1. companies - 企業資料集合
 * 2. tenders - 政府標案資料集合  
 * 3. ai_tools - AI 工具資料集合
 * 4. feedbacks - 使用者意見回饋
 * 5. pcc_api_cache - 政府採購網 API 快取
 * 6. g0v_company_api_cache - G0V 企業資料 API 快取
 * 7. twincn_api_cache - 台灣企業網 API 快取
 */

const { MongoClient } = require('mongodb');

/**
 * MongoDB 設定
 */
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/business-magnifier?authSource=admin';
const DB_NAME = 'business-magnifier';

/**
 * Collections 定義和索引配置
 * Collections 定義和索引配置（7個完整 Collections）
 */
const COLLECTIONS_CONFIG = {
  // 1. 核心業務資料 Collections
  companies: {
    description: '企業資料集合 - 儲存台灣企業的基本資料、財務資訊、董監事資料等',
    indexes: [
      { keys: { taxId: 1 }, options: { unique: true, name: 'taxId_unique' } },
      { keys: { name: 'text', fullName: 'text' }, options: { name: 'text_search' } },
      { keys: { industry: 1 }, options: { name: 'industry_1' } },
      { keys: { establishedDate: -1 }, options: { name: 'establishedDate_-1' } },
      { keys: { searchKeywords: 1 }, options: { name: 'searchKeywords_1' } },
      { keys: { tenderCount: -1 }, options: { name: 'tenderCount_-1' } },
      { keys: { sitemapIndexed: 1 }, options: { name: 'sitemapIndexed_1' } }
    ]
  },

  tenders: {
    description: '政府標案資料集合 - 儲存政府採購網的標案資料',
    indexes: [
      { keys: { _id: 1 }, options: { name: 'id_index' } },
      { keys: { status: 1 }, options: { name: 'status_index' } },
      { keys: { tenderValue: -1 }, options: { name: 'tenderValue_-1' } },
      { keys: { publishDate: -1 }, options: { name: 'publishDate_-1' } },
      { keys: { unitId: 1 }, options: { name: 'unitId_1' } },
      { keys: { jobNumber: 1 }, options: { name: 'jobNumber_1' } },
      { keys: { title: 'text' }, options: { name: 'title_text' } },
      { keys: { sitemapIndexed: 1 }, options: { name: 'sitemapIndexed_1' } }
    ]
  },

  ai_tools: {
    description: 'AI 工具資料集合 - 儲存 AI 工具和提示詞模板',
    indexes: [
      { keys: { id: 1 }, options: { unique: true, name: 'id_unique' } },
      { keys: { category: 1, isActive: 1 }, options: { name: 'category_active' } },
      { keys: { tags: 1, isActive: 1 }, options: { name: 'tags_1_isActive_1' } },
      { keys: { 'usage.popularityScore': -1 }, options: { name: 'popularityScore_-1' } },
      { keys: { name: 'text', description: 'text' }, options: { name: 'name_desc_text' } }
    ]
  },

  feedbacks: {
    description: '使用者意見回饋 - 儲存結構化的使用者意見回饋，包含狀態、優先級等',
    indexes: [
      { keys: { status: 1, priority: -1 }, options: { name: 'status_priority_index' } },
      { keys: { category: 1 }, options: { name: 'category_index' } },
      { keys: { assignedTo: 1 }, options: { name: 'assignedTo_index' } },
      { keys: { createdAt: -1 }, options: { name: 'createdAt_sort_index' } },
      { keys: { email: 1 }, options: { name: 'email_lookup_index' } }
    ]
  },

  // 2. API 快取 Collections
  pcc_api_cache: {
    description: '政府採購網 API 快取 - 快取外部 API 回應，提升效能',
    indexes: [
      { keys: { api_key: 1 }, options: { unique: true, name: 'api_key_unique' } },
      { keys: { expires_at: 1 }, options: { expireAfterSeconds: 0, name: 'expires_at_ttl' } },
      { keys: { fetched_at: -1 }, options: { name: 'fetched_at_-1' } },
      { keys: { request_count: -1 }, options: { name: 'request_count_-1' } }
    ]
  },

  g0v_company_api_cache: {
    description: 'G0V 企業資料 API 快取 - 快取 G0V 企業資料 API 回應',
    indexes: [
      { keys: { api_key: 1 }, options: { unique: true, name: 'api_key_unique' } },
      { keys: { company_id: 1 }, options: { name: 'company_id_1' } },
      { keys: { expires_at: 1 }, options: { expireAfterSeconds: 0, name: 'expires_at_ttl' } },
      { keys: { fetched_at: -1 }, options: { name: 'fetched_at_-1' } },
      { keys: { data_source: 1 }, options: { name: 'data_source_1' } }
    ]
  },

  twincn_api_cache: {
    description: '台灣企業網 API 快取 - 快取台灣企業網股務資訊 API 回應',
    indexes: [
      { keys: { api_key: 1 }, options: { unique: true, name: 'api_key_unique' } },
      { keys: { company_taxid: 1 }, options: { name: 'company_taxid_1' } },
      { keys: { expires_at: 1 }, options: { expireAfterSeconds: 0, name: 'expires_at_ttl' } },
      { keys: { data_type: 1 }, options: { name: 'data_type_1' } },
      { keys: { fetched_at: -1 }, options: { name: 'fetched_at_-1' } }
    ]
  }
};

/**
 * 建立單一 Collection 和其索引
 */
async function createCollection(db, collectionName, config) {
  const result = { created: false, indexes: { created: 0, skipped: 0, failed: 0 } };
  try {
    console.log(`\n📁 正在處理 Collection: ${collectionName}`);
    console.log(`   描述: ${config.description}`);

    const collections = await db.listCollections({ name: collectionName }).toArray();
    
    if (collections.length === 0) {
      await db.createCollection(collectionName);
      console.log(`   ✅ Collection "${collectionName}" 建立成功`);
      result.created = true;
    } else {
      console.log(`   ℹ️  Collection "${collectionName}" 已存在，跳過建立`);
    }

    const collection = db.collection(collectionName);
    const existingIndexes = await collection.listIndexes().toArray();
    const existingIndexNames = existingIndexes.map(idx => idx.name);

    for (const indexConfig of config.indexes) {
      if (existingIndexNames.includes(indexConfig.options.name)) {
        console.log(`      - 索引 "${indexConfig.options.name}" 已存在，跳過`);
        result.indexes.skipped++;
      } else {
        try {
          await collection.createIndex(indexConfig.keys, indexConfig.options);
          console.log(`      - ✅ 索引 "${indexConfig.options.name}" 建立成功`);
          result.indexes.created++;
        } catch (error) {
          console.log(`      - ❌ 索引 "${indexConfig.options.name}" 建立失敗:`, error.message);
          result.indexes.failed++;
        }
      }
    }
    return { success: true, result };
  } catch (error) {
    console.error(`❌ 處理 Collection "${collectionName}" 失敗:`, error.message);
    return { success: false, result };
  }
}

/**
 * 主要初始化函式
 */
async function initializeMongoDBCollections() {
  console.log('🚀 Business Magnifier MongoDB Collections 初始化開始');
  const totalCollections = Object.keys(COLLECTIONS_CONFIG).length;
  console.log(`🎯 目標：檢查並設定 ${totalCollections} 個 Collections`);
  
  let client;

  try {
    console.log('\n🔌 正在連接到 MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ MongoDB 連線成功');

    const db = client.db(DB_NAME);
    console.log(`🏠 使用資料庫: ${DB_NAME}`);

    const stats = { created: 0, skipped: 0, failed: 0, indexes: { created: 0, skipped: 0, failed: 0 } };

    for (const [collectionName, config] of Object.entries(COLLECTIONS_CONFIG)) {
      const { success, result } = await createCollection(db, collectionName, config);
      if (success) {
        if (result.created) stats.created++; else stats.skipped++;
        stats.indexes.created += result.indexes.created;
        stats.indexes.skipped += result.indexes.skipped;
        stats.indexes.failed += result.indexes.failed;
      } else {
        stats.failed++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 初始化完成報告:');
    console.log(`   - Collections: ${stats.created} 個新建, ${stats.skipped} 個已存在, ${stats.failed} 個失敗`);
    console.log(`   - 索引: ${stats.indexes.created} 個新建, ${stats.indexes.skipped} 個已存在, ${stats.indexes.failed} 個失敗`);
    
    if (stats.failed === 0) {
      console.log('\n🎉 所有 Collections 均已設定完成！');
    } else {
      console.log(`\n⚠️  有 ${stats.failed} 個 Collections 處理失敗，請檢查上方日誌`);
    }
    
  } catch (error) {
    console.error('\n❌ MongoDB 初始化遭遇嚴重錯誤:', error.message);
    if (error.message.includes('ECONNREFUSED')) {
      console.error('💡 提示: 請確認 MongoDB 服務是否已啟動 (npm run docker:mongo)');
    }
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 MongoDB 連線已關閉');
    }
  }
}

/**
 * 執行腳本
 */
if (require.main === module) {
  initializeMongoDBCollections().catch(console.error);
}

module.exports = {
  initializeMongoDBCollections,
  COLLECTIONS_CONFIG
};