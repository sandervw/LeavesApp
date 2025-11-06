import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../../src/app';


describe('Session Controller Tests', () => {

  beforeEach(async () => {
    // Clear all collections before each test
    await mongoose.connection.dropDatabase();
  });

  describe('FUNCTION', () => {
    it('TODO', async () => { });

    it('TODO', async () => { });

    it('TODO', async () => { });
  });

});