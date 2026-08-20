const mongoose = require('mongoose');
const env = require('./env');

// Disable buffering so queries fail immediately to fallback when DB is disconnected
mongoose.set('bufferCommands', false);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`[MongoDB Warning] Direct database connection unavailable (${error.message}). Memory fallback active.`);
    return null;
  }
};

module.exports = connectDB;
