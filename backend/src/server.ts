import 'dotenv/config'; // NEEDS TO BE ON TOP: loads environment variables from a .env file
import { PORT, NODE_ENV } from './constants/env';
import connectToDatabase from './config/db';
import { app } from "./app";
import { logger } from './utils/logger';

/*
* Starts the Express server after connecting to the database.
*/
app.listen(PORT, async () => {
  logger.info(`Listening on Port ${PORT} in ${NODE_ENV}`);
  await connectToDatabase();
});