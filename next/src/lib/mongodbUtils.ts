import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'corp-insight';

let client: MongoClient | null = null;
let dbInstance: Db | null = null;

async function getMongoClient(): Promise<MongoClient> {
  // 對於 MongoDB driver v4+，如果 client 不是 null，則假設它已連接
  // 或 connect() 應該已經拋出錯誤。
  if (client) {
    // console.log('MongoDB：重複使用現有的客戶端連線');
    return client;
  }
  try {
    // console.log('MongoDB：正在建立新的客戶端連線...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    // console.log('MongoDB：客戶端連線成功');
    return client;
  } catch (error) {
    console.error('MongoDB：客戶端連線時發生錯誤', error);
    client = null;
    throw error;
  }
}

export async function getDb(): Promise<Db> {
  // 如果 dbInstance 存在且 client 不是 null (意味著已連接)，則重複使用它。
  if (dbInstance && client) {
    // console.log('MongoDB：重複使用現有的資料庫實例');
    return dbInstance;
  }
  try {
    const mongoClient = await getMongoClient();
    dbInstance = mongoClient.db(DB_NAME);
    // console.log(`MongoDB：已取得 "${DB_NAME}" 的資料庫實例`);
    return dbInstance;
  } catch (error) {
    console.error('MongoDB：取得資料庫實例時發生錯誤', error);
    dbInstance = null;
    throw error;
  }
}

/**
 * 如果 MongoDB 中存在且未過期，則檢索快取的 API 資料。
 * @param collectionName 快取集合的名稱。
 * @param apiKey 唯一標識 API 請求的鍵（例如：URL）。
 * @returns 快取的資料，如果找不到或已過期則返回 null。
 */
export async function getCachedApiData<T = any>(
  collectionName: string,
  apiKey: string
): Promise<T | null> {
  try {
    const db = await getDb();
    const collection = db.collection(collectionName);
    const cachedItem = await collection.findOne({
      api_key: apiKey,
      expires_at: { $gt: new Date() },
    });

    if (cachedItem) {
      // console.log(`MongoDB 快取命中，鍵值為 "${apiKey}"，位於 "${collectionName}"`);
      return cachedItem.data as T;
    }
    // console.log(`MongoDB 快取未命中，鍵值為 "${apiKey}"，位於 "${collectionName}"`);
    return null;
  } catch (error) {
    console.error(
      `MongoDB：從 "${collectionName}" 取得鍵值為 "${apiKey}" 的快取資料時發生錯誤`,
      error
    );
    return null; // 發生錯誤時，視為快取未命中
  }
}

/**
 * 將 API 資料設定到具有 TTL 的 MongoDB 快取中。
 * @param collectionName 快取集合的名稱。
 * @param apiKey 唯一標識 API 請求的鍵。
 * @param data 要快取的資料。
 * @param ttlSeconds 快取條目的存活時間（秒）。
 */
export async function setCachedApiData(
  collectionName: string,
  apiKey: string,
  data: any,
  ttlSeconds: number
): Promise<void> {
  try {
    const db = await getDb();
    const collection = db.collection(collectionName);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttlSeconds * 1000);

    await collection.updateOne(
      { api_key: apiKey },
      { $set: { data, fetched_at: now, expires_at: expiresAt } },
      { upsert: true }
    );
    // console.log(`MongoDB 快取已設定，鍵值為 "${apiKey}"，位於 "${collectionName}"，過期時間為 ${expiresAt.toISOString()}`);
  } catch (error) {
    console.error(
      `MongoDB：在 "${collectionName}" 中為鍵值 "${apiKey}" 設定快取資料時發生錯誤`,
      error
    );
  }
}

/**
 * 將電子郵件驗證嘗試記錄到資料庫。
 * @param email 收件人的電子郵件地址。
 * @param token 為驗證生成的 JWT。
 * @param isSuccess 電子郵件是否成功發送。
 * @param sentAt 嘗試發送電子郵件的時間戳。
 * @param jwtExpiresAt JWT 的過期時間戳。
 */
export async function logEmailVerification(
  email: string,
  token: string,
  isSuccess: boolean,
  sentAt: Date,
  jwtExpiresAt: Date
): Promise<void> {
  try {
    const db = await getDb();
    const collection = db.collection('email_verifications');
    await collection.insertOne({
      email,
      token,
      isSuccess,
      sentAt,
      jwtExpiresAt,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error('MongoDB：記錄電子郵件驗證嘗試時發生錯誤', error);
    // 我們在這裡不重新拋出錯誤，以避免中斷正在發送郵件的父進程。
    // 記錄日誌是一個副作用。
  }
}
