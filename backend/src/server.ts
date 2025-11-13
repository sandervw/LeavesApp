import 'dotenv/config'; // NEEDS TO BE ON TOP: loads environment variables from a .env file
import { initializeSecrets } from './config/secrets';

/*
* Starts the Express server after loading secrets and connecting to the database.
*/
const startServer = async () => {
  // Load all secrets from Key Vault (in production) before starting
  await initializeSecrets();

  // Now import app and other dependencies (which read from process.env)
  const { PORT, NODE_ENV } = await import('./constants/env');
  const connectToDatabase = await import('./config/db');
  const { app } = await import('./app');
  const { logger } = await import('./utils/logger');

  app.listen(PORT, async () => {
    logger.info(`Listening on Port ${PORT} in ${NODE_ENV}`);
    await connectToDatabase.default();
  });
};

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});