import mongoose from 'mongoose';

export const connectDB = async () => {
      try {
            await mongoose.connect(
                  'mongodb://admin:canals@172.16.113.2/anitrackguess?retryWrites=true&w=majority'
            );
            console.log('DB is connected');
      } catch (error) {
            console.error('Database connection error:', error.message);
            process.exit(1);
      }
};


export const closeDB = async () => {
      try {
            await mongoose.connection.close();
      } catch (error) {
            console.error('Database disconnection error:', error.message);
            process.exit(1);
      }
};