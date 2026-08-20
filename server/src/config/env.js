const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

module.exports = {
  PORT: process.env.PORT || 5000,
  HOST: process.env.HOST || '0.0.0.0',
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/prepmate',
  JWT_SECRET: process.env.JWT_SECRET || 'prepmate_secret_key_fallback_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  DEFAULT_AI_PROVIDER: process.env.DEFAULT_AI_PROVIDER || 'mock',
  ADMIN_SIGNUP_CODE: process.env.ADMIN_SIGNUP_CODE || 'admin123secret',
};
