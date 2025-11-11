import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { NODE_ENV } from '../constants/env';
import { OK } from '../constants/http';
import appAssert from '../utils/appAssert';

/**
 * Test Controller - Only available in test environment
 * Provides endpoints for test utilities like database clearing
 */

/**
 * Clears all collections in the database
 * DANGEROUS: Only works in test environment
 */
export const clearDatabaseHandler = async (req: Request, res: Response) => {
  // Security check: only allow in test environment
  appAssert(
    NODE_ENV === 'test',
    500,
    'Database clearing is only allowed in test environment'
  );

  // Drop all collections in the database
  const collections = mongoose.connection.collections;
  const dropPromises = Object.values(collections).map((collection) =>
    collection.deleteMany({})
  );

  await Promise.all(dropPromises);

  res.status(OK).json({
    message: 'Database cleared successfully',
    collectionsCleared: Object.keys(collections).length,
  });
};
