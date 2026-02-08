import { MongoClient, Db, Collection } from 'mongodb';

const uri = process.env.NEXT_PUBLIC_MONGODB_URI || 'mongodb+srv://ashoka_db_user:fddvpY644hnyr1CP@ashoka.zgtsisp.mongodb.net/';
const dbName = process.env.NEXT_PUBLIC_MONGODB_DB || 'spare';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectToMongoDB(): Promise<Db> {
  if (db) {
    return db;
  }

  try {
    client = new MongoClient(uri);
    await client.connect();
    db = client.db(dbName);
    console.log('Connected to MongoDB');
    return db;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw new Error('Failed to connect to database');
  }
}

export async function getMerchantsCollection(): Promise<Collection> {
  const database = await connectToMongoDB();
  return database.collection('merchants');
}

export async function getLeftoverItemsCollection(): Promise<Collection> {
  const database = await connectToMongoDB();
  return database.collection('leftover_items');
}

export async function getRescueBagsCollection(): Promise<Collection> {
  const database = await connectToMongoDB();
  return database.collection('rescue_bags');
}

export async function closeConnection(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('MongoDB connection closed');
  }
}
