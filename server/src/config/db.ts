// server/src/config/db.ts
import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/stacks-finance';
    console.log(`Connecting to MongoDB: ${mongoUri.replace(/([^:]+:\/\/[^:]+:)[^@]+@/, '$1****@')}`);
    
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error instanceof Error ? error.message : 'Unknown error'}`);
    console.error(`Using MongoDB URI: ${process.env.MONGODB_URI?.replace(/([^:]+:\/\/[^:]+:)[^@]+@/, '$1****@')}`);
    process.exit(1);
  }
};

export default connectDB;