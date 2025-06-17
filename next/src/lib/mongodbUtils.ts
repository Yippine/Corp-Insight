import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'business-magnifier';

let client: MongoClient | null = null;
let dbInstance: Db | null = null;

async function getMongoClient(): Promise<MongoClient> {
  // For MongoDB driver v4+, if client is not null, it's assumed to be connected
  // or connect() would have thrown an error.
  if (client) {
    // console.log('MongoDB: Reusing existing client connection');
    return client;
  }
  try {
    // console.log('MongoDB: Creating new client connection...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    // console.log('MongoDB: Client connected successfully');
    return client;
  } catch (error) {
    console.error('MongoDB: Error connecting to client', error);
    client = null;
    throw error;
  }
}

export async function getDb(): Promise<Db> {
  // If dbInstance exists and client is not null (implying connected), reuse it.
  if (dbInstance && client) {
    // console.log('MongoDB: Reusing existing DB instance');
    return dbInstance;
  }
  try {
    const mongoClient = await getMongoClient();
    dbInstance = mongoClient.db(DB_NAME);
    // console.log(`MongoDB: DB instance for "${DB_NAME}" obtained`);
    return dbInstance;
  } catch (error) {
    console.error('MongoDB: Error getting DB instance', error);
    dbInstance = null;
    throw error;
  }
}

/**
 * Retrieves cached API data from MongoDB if it exists and is not expired.
 * @param collectionName The name of the cache collection.
 * @param apiKey A unique key identifying the API request (e.g., URL).
 * @returns The cached data or null if not found or expired.
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
      // console.log(`MongoDB Cache HIT for key "${apiKey}" in "${collectionName}"`);
      return cachedItem.data as T;
    }
    // console.log(`MongoDB Cache MISS for key "${apiKey}" in "${collectionName}"`);
    return null;
  } catch (error) {
    console.error(
      `MongoDB: Error getting cached data from "${collectionName}" for key "${apiKey}"`,
      error
    );
    return null; // On error, behave as cache miss
  }
}

/**
 * Sets API data into the MongoDB cache with a TTL.
 * @param collectionName The name of the cache collection.
 * @param apiKey A unique key identifying the API request.
 * @param data The data to cache.
 * @param ttlSeconds Time-to-live in seconds for the cache entry.
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
    // console.log(`MongoDB Cache SET for key "${apiKey}" in "${collectionName}", expires at ${expiresAt.toISOString()}`);
  } catch (error) {
    console.error(
      `MongoDB: Error setting cached data in "${collectionName}" for key "${apiKey}"`,
      error
    );
  }
}
