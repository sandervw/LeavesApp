import { Router } from 'express';
import { clearDatabaseHandler } from '../controllers/test.controller';

const testRoutes = Router();

// DELETE /test/clear-database - Clears all data from database (test environment only)
testRoutes.delete('/clear-database', clearDatabaseHandler);

export default testRoutes;
