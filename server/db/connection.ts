import mongoose from 'mongoose';
import { config } from '../config';

let isConnected = false;

export async function connectDatabase(): Promise<boolean> {
  if (isConnected) return true;

  try {
    mongoose.set('strictQuery', true);
    
    // Connect with a 5-second timeout so it doesn't hang if MongoDB isn't running
    await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = true;
    console.log(`🍃 MongoDB Connected successfully to database: ${mongoose.connection.name}`);
    console.log(`📡 MongoDB Host: ${mongoose.connection.host}:${mongoose.connection.port}`);

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Reconnecting...');
      isConnected = false;
    });

    return true;
  } catch (err: any) {
    isConnected = false;
    console.warn('\n⚠️ MongoDB Connection Notice:');
    console.warn(`   Could not connect to MongoDB at "${config.mongodbUri}".`);
    console.warn(`   Reason: ${err.message}`);
    console.warn('   💡 Tip: To use MongoDB:');
    console.warn('      1. Ensure MongoDB service is running locally (`mongod`), OR');
    console.warn('      2. Add a cloud MongoDB Atlas URI in your .env file:');
    console.warn('         MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/nexus_crm');
    console.warn('   The server will continue running and provide persistent JSON storage as fallback.\n');
    return false;
  }
}

export function isDbConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

export async function closeDatabase(): Promise<void> {
  if (isConnected) {
    await mongoose.connection.close();
    isConnected = false;
  }
}

