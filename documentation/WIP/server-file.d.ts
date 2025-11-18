/** *server.ts */
// total size: 592 chars
import 'dotenv/config';
import { initializeSecrets } from './config/secrets';

declare const startServer: () => Promise<void>;
