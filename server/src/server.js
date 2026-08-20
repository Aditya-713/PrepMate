const app = require('./app');
const env = require('./config/env');
const connectDB = require('./config/db');

const PORT = env.PORT || 5000;

const HOST = env.HOST || '0.0.0.0';

// Connect to Database and start server
connectDB().then(() => {
  app.listen(PORT, HOST, () => {
    console.log(`==================================================`);
    console.log(`🚀 PrepMate Server running in [${env.NODE_ENV}] mode`);
    console.log(`🌐 Server URL: http://${HOST}:${PORT}`);
    console.log(`==================================================`);
  });
});
