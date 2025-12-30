import { createApp } from './app.js';
import { env } from './config/env.js';
import { testConnection } from './config/database.js';

async function main() {
  console.log('🚀 Starting Fluent in Four server...');

  // Test database connection
  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.error('Failed to connect to database. Exiting.');
    process.exit(1);
  }

  // Create and start server
  const app = createApp();
  const port = parseInt(env.PORT, 10);

  app.listen(port, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${port}`);
    console.log(`   Environment: ${env.NODE_ENV}`);
    console.log(`   Client URL: ${env.CLIENT_URL}`);
  });
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
