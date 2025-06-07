import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './.env.local' });

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`📁 MongoDB Connected: ${conn.connection.host}`);
    console.log(`🏷️  Database Name: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('📤 MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error(`🚨 MongoDB error: ${err}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('📴 MongoDB connection closed through app termination');
  process.exit(0);
});

export { connectDB };
export default mongoose;
