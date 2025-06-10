#!/usr/bin/env node
/**
 * Business Magnifier MongoDB Collections 初始化腳本
 * 
 * 用途: 根據專案架構規則重建所有必要的 MongoDB Collections 和索引
 * 執行方式: node scripts/init-mongodb-collections.js
 * 
 * 重建的 9 個 Collections:
 * 1. companies - 企業資料集合
 * 2. tenders - 政府標案資料集合  
 * 3. ai_tools - AI 工具資料集合
 * 4. pcc_api_cache - 政府採購網 API 快取
 * 5. g0v_company_api_cache - G0V 企業資料 API 快取
 * 6. twincn_api_cache - 台灣企業網 API 快取
 * 7. email_verification_log - Email 驗證日誌
 * 8. feedback_submissions_log - 意見回饋提交日誌
 */

const { MongoClient } = require('mongodb');

/**
 * MongoDB 設定
 */
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/business-magnifier?authSource=admin';
const DB_NAME = 'business-magnifier';

/**
 * Collections 定義和索引配置（9個完整 Collections）
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
  },

  // 3. 系統日誌 Collections
  email_verification_log: {
    description: 'Email 驗證日誌 - 記錄 Email 驗證碼發送和驗證過程',
    indexes: [
      { keys: { email: 1, verification_code: 1 }, options: { name: 'email_code_compound' } },
      { keys: { expires_at: 1 }, options: { expireAfterSeconds: 0, name: 'expires_at_ttl' } },
      { keys: { status: 1 }, options: { name: 'status_1' } },
      { keys: { created_at: -1 }, options: { name: 'created_at_-1' } },
      { keys: { purpose: 1 }, options: { name: 'purpose_1' } }
    ]
  },

  feedback_submissions_log: {
    description: '意見回饋提交日誌 - 記錄使用者意見回饋提交紀錄',
    indexes: [
      { keys: { status: 1 }, options: { name: 'status_1' } },
      { keys: { category: 1 }, options: { name: 'category_1' } },
      { keys: { priority: 1 }, options: { name: 'priority_1' } },
      { keys: { email: 1 }, options: { name: 'email_1' } },
      { keys: { created_at: -1 }, options: { name: 'created_at_-1' } },
      { keys: { tags: 1 }, options: { name: 'tags_1' } },
      { keys: { user_id: 1 }, options: { name: 'user_id_1' } }
    ]
  }
};

/**
 * 建立單一 Collection 和其索引
 */
async function createCollection(db, collectionName, config) {
  try {
    console.log(`\n📁 建立 Collection: ${collectionName}`);
    console.log(`   描述: ${config.description}`);

    // 檢查 Collection 是否已存在
    const collections = await db.listCollections({ name: collectionName }).toArray();
    
    if (collections.length === 0) {
      // 建立 Collection
      await db.createCollection(collectionName);
      console.log(`   ✅ Collection "${collectionName}" 建立成功`);
    } else {
      console.log(`   ℹ️  Collection "${collectionName}" 已存在，跳過建立`);
    }

    // 建立索引
    const collection = db.collection(collectionName);
    console.log(`   🔍 建立索引...`);

    for (const indexConfig of config.indexes) {
      try {
        await collection.createIndex(indexConfig.keys, indexConfig.options);
        console.log(`      ✅ 索引 "${indexConfig.options.name}" 建立成功`);
      } catch (error) {
        if (error.code === 85) { // IndexOptionsConflict
          console.log(`      ⚠️  索引 "${indexConfig.options.name}" 已存在但配置不同，嘗試重建中...`);
          try {
            await collection.dropIndex(indexConfig.options.name);
            await collection.createIndex(indexConfig.keys, indexConfig.options);
            console.log(`      ✅ 索引 "${indexConfig.options.name}" 重建成功`);
          } catch (rebuildError) {
            console.log(`      ❌ 索引 "${indexConfig.options.name}" 重建失敗:`, rebuildError.message);
          }
        } else if (error.code === 86) { // IndexKeySpecsConflict
          console.log(`      ℹ️  索引 "${indexConfig.options.name}" 已存在，跳過`);
        } else {
          console.log(`      ❌ 索引 "${indexConfig.options.name}" 建立失敗:`, error.message);
        }
      }
    }

    return true;
  } catch (error) {
    console.error(`❌ 建立 Collection "${collectionName}" 失敗:`, error.message);
    return false;
  }
}

/**
 * 主要初始化函式
 */
async function initializeMongoDBCollections() {
  let client;

  try {
    console.log('🚀 Business Magnifier MongoDB Collections 初始化開始');
    console.log('🎯 目標：建立 9 個完整的 Collections');
    console.log('=' * 60);
    
    // 連接到 MongoDB
    console.log('\n🔌 正在連接到 MongoDB...');
    console.log(`📍 連線位址: ${MONGODB_URI.replace(/\/\/.*@/, '//***:***@')}`);
    
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    console.log('✅ MongoDB 連線成功');

    // 選擇資料庫
    const db = client.db(DB_NAME);
    console.log(`🏠 使用資料庫: ${DB_NAME}`);

    // 顯示現有 Collections
    const existingCollections = await db.listCollections().toArray();
    console.log(`\n📋 現有 Collections (${existingCollections.length}): ${existingCollections.map(c => c.name).join(', ')}`);

    // 建立所有 Collections
    console.log(`\n🛠️  開始建立 ${Object.keys(COLLECTIONS_CONFIG).length} 個 Collections...`);
    
    let successCount = 0;
    const failedCollections = [];

    for (const [collectionName, config] of Object.entries(COLLECTIONS_CONFIG)) {
      const success = await createCollection(db, collectionName, config);
      if (success) {
        successCount++;
      } else {
        failedCollections.push(collectionName);
      }
    }

    // 總結報告
    console.log('\n' + '=' * 60);
    console.log('📊 初始化完成報告:');
    console.log(`   ✅ 成功建立: ${successCount} 個 Collections`);
    
    if (failedCollections.length > 0) {
      console.log(`   ❌ 失敗項目: ${failedCollections.join(', ')}`);
    }

    // 顯示最終狀態
    const finalCollections = await db.listCollections().toArray();
    console.log(`\n📋 最終 Collections (${finalCollections.length}):`);
    
    // 按照邏輯分組顯示
    const coreCollections = ['companies', 'tenders', 'ai_tools'];
    const cacheCollections = ['pcc_api_cache', 'g0v_company_api_cache', 'twincn_api_cache'];
    const logCollections = ['email_verification_log', 'feedback_submissions_log'];
    
    console.log('   🏢 核心業務資料:');
    coreCollections.forEach(name => {
      const exists = finalCollections.find(c => c.name === name);
      console.log(`      ${exists ? '✅' : '❌'} ${name}`);
    });
    
    console.log('   🗂️  API 快取:');
    cacheCollections.forEach(name => {
      const exists = finalCollections.find(c => c.name === name);
      console.log(`      ${exists ? '✅' : '❌'} ${name}`);
    });
    
    console.log('   📝 系統日誌:');
    logCollections.forEach(name => {
      const exists = finalCollections.find(c => c.name === name);
      console.log(`      ${exists ? '✅' : '❌'} ${name}`);
    });

    // 資料庫統計
    const stats = await db.stats();
    console.log(`\n📈 資料庫統計:`);
    console.log(`   💾 資料庫大小: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   📚 集合數量: ${stats.collections}`);
    console.log(`   🗂️  索引數量: ${stats.indexes}`);

    // 驗證預期的 9 個 Collections 是否都存在
    const expectedCollections = Object.keys(COLLECTIONS_CONFIG);
    const missingCollections = expectedCollections.filter(name => 
      !finalCollections.find(c => c.name === name)
    );
    
    if (missingCollections.length === 0) {
      console.log('\n🎉 所有 9 個 Collections 建立完成！');
    } else {
      console.log(`\n⚠️  缺少 ${missingCollections.length} 個 Collections: ${missingCollections.join(', ')}`);
    }
    
  } catch (error) {
    console.error('\n❌ MongoDB 初始化失敗:', error.message);
    
    // 提供錯誤診斷建議
    if (error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 錯誤診斷建議:');
      console.error('   1. 檢查 MongoDB 服務是否已啟動');
      console.error('   2. 檢查連線埠 27017 是否可用');
      console.error('   3. 如使用 Docker: npm run docker:mongo');
      console.error('   4. 等待 MongoDB 完全啟動 (約 30-60 秒)');
    } else if (error.message.includes('Authentication failed')) {
      console.error('\n💡 認證錯誤診斷:');
      console.error('   1. 檢查使用者名稱和密碼是否正確');
      console.error('   2. 檢查 authSource 設定');
      console.error('   3. 確認 MongoDB 初始化完成');
    }
    
    process.exit(1);
  } finally {
    // 關閉連線
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
  console.log('⚙️  啟動 MongoDB Collections 初始化腳本...\n');
  
  initializeMongoDBCollections()
    .then(() => {
      console.log('\n✨ 腳本執行完成');
      console.log('🎯 請使用 http://localhost:8081 檢查 MongoDB Express 管理介面');
      console.log('🚀 現在可以執行 npm run dev 啟動應用程式');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 腳本執行失敗:', error);
      process.exit(1);
    });
}

module.exports = {
  initializeMongoDBCollections,
  COLLECTIONS_CONFIG
};