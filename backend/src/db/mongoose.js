import { connect } from 'mongoose';

export default async function connectDB() {
  try {
      await connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      });
      console.log('MongoDB connected');
  } catch (error) {
      console.error(error.message);
      process.exit(1);
  }
}

module.exports = connectDB;