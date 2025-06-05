import mongoose from 'mongoose';

// MongoDB 連線狀態
interface MongoConnection {
  isConnected?: number;
}

const connection: MongoConnection = {};

/**
 * 取得 MongoDB 連線 URI
 * 支援本地開發和 Docker 環境
 */
function getMongoURI(): string {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    // 預設本地開發環境連線
    const defaultURI = 'mongodb://localhost:27017/business-magnifier';
    console.log('⚠️ 未設定 MONGODB_URI，使用預設本地連線:', defaultURI);
    return defaultURI;
  }

  return MONGODB_URI;
}

/**
 * MongoDB 連線函式
 * 使用連線池和快取機制，避免重複連線
 * 針對本地開發環境優化
 */
async function connectToDatabase(): Promise<typeof mongoose> {
  // 如果已經連線，直接返回
  if (connection.isConnected) {
    console.log('🔄 使用現有的 MongoDB 連線');
    return mongoose;
  }

  try {
    const MONGODB_URI = getMongoURI();

    // 連線配置選項 (針對本地開發優化)
    const options = {
      bufferCommands: false,
      maxPoolSize: 10, // 連線池最大連線數
      serverSelectionTimeoutMS: 5000, // 伺服器選擇超時
      socketTimeoutMS: 45000, // Socket 超時
      connectTimeoutMS: 10000, // 連線超時
      family: 4, // 使用 IPv4
      retryWrites: true, // 啟用重試寫入
      w: 'majority', // 寫入確認
    };

    // 建立連線
    console.log('🔌 正在連線到 MongoDB...');
    console.log('📍 連線位址:', MONGODB_URI.replace(/\/\/.*@/, '//***:***@')); // 隱藏密碼

    const db = await mongoose.connect(MONGODB_URI, options);

    connection.isConnected = db.connections[0].readyState;

    console.log('✅ MongoDB 連線成功');
    console.log('🏠 資料庫名稱:', db.connections[0].name);
    console.log('🌐 連線狀態:', getConnectionStatus());

    return db;
  } catch (error) {
    console.error('❌ MongoDB 連線失敗:', error);

    // 提供詳細的錯誤診斷
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED')) {
        console.error('💡 建議檢查:');
        console.error('   1. MongoDB 服務是否已啟動');
        console.error('   2. 連線埠 27017 是否可用');
        console.error('   3. 如使用 Docker: docker-compose up mongodb -d');
      } else if (error.message.includes('Authentication failed')) {
        console.error('💡 建議檢查:');
        console.error('   1. 使用者名稱和密碼是否正確');
        console.error('   2. 資料庫權限設定');
      }
    }

    throw new Error(`MongoDB 連線失敗: ${error}`);
  }
}

/**
 * 斷開 MongoDB 連線
 */
async function disconnectFromDatabase(): Promise<void> {
  if (connection.isConnected) {
    await mongoose.disconnect();
    connection.isConnected = 0;
    console.log('🔌 MongoDB 連線已斷開');
  }
}

/**
 * 檢查連線狀態
 */
function getConnectionStatus(): string {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  return (
    states[mongoose.connection.readyState as keyof typeof states] || 'unknown'
  );
}

/**
 * 檢查資料庫健康狀態
 */
async function checkDatabaseHealth(): Promise<{
  status: string;
  responseTime: number;
  collections: number;
}> {
  try {
    const startTime = Date.now();

    // 執行簡單的 ping 操作
    await mongoose.connection.db?.admin().ping();

    const responseTime = Date.now() - startTime;

    // 取得集合數量
    const collections = await mongoose.connection.db
      ?.listCollections()
      .toArray();

    return {
      status: 'healthy',
      responseTime,
      collections: collections?.length || 0,
    };
  } catch {
    return {
      status: 'unhealthy',
      responseTime: -1,
      collections: 0,
    };
  }
}

// 監聽連線事件
mongoose.connection.on('connected', () => {
  console.log('🟢 Mongoose 已連線到 MongoDB');
});

mongoose.connection.on('error', err => {
  console.error('🔴 Mongoose 連線錯誤:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🟡 Mongoose 已斷開 MongoDB 連線');
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 Mongoose 已重新連線到 MongoDB');
});

// 開發環境下啟用詳細日誌
if (process.env.NODE_ENV === 'development') {
  mongoose.set('debug', true);
}

// 程序結束時自動斷開連線
process.on('SIGINT', async () => {
  console.log('\n🛑 收到中斷信號，正在關閉 MongoDB 連線...');
  await mongoose.connection.close();
  console.log('🔌 程序結束，MongoDB 連線已關閉');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 收到終止信號，正在關閉 MongoDB 連線...');
  await mongoose.connection.close();
  console.log('🔌 程序終止，MongoDB 連線已關閉');
  process.exit(0);
});

export {
  connectToDatabase,
  disconnectFromDatabase,
  getConnectionStatus,
  checkDatabaseHealth,
};

export default connectToDatabase;
