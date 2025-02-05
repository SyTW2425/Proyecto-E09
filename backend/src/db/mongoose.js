import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Connect to the database
 */
export const connectDB = async () => {
  try {
    // from .env or from environment variables
    await mongoose.connect(process.env.ATLAS_URI);
    console.log('DB is connected');
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

/**
 * Close the database connection
 */
export const closeDB = async () => {
  try {
    await mongoose.connection.close();
  } catch (error) {
    console.error('Database disconnection error:', error.message);
    process.exit(1);
  }
};
