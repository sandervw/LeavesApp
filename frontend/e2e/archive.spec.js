import { test, expect } from '@playwright/test';
import { setupAuthenticatedUser, createStorynode, createStorynodeTree, waitForApiResponse } from './helpers.js';

/**
 * Archive E2E Tests
 *
 * Tests cover archive functionality including:
 * - Archiving storynodes
 * - Unarchiving storynodes
 * - Filtering archived vs active storynodes
 */

test.describe('Archive Operations', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedUser(page);
  });

  test('should archive a storynode from detail page', async ({ page }) => { });

  test('should unarchive a storynode and return it to stories', async ({ page }) => { });

  test('should preserve storynode content when archiving/unarchiving', async ({ page }) => { });

  test('should navigate between stories and archive pages', async ({ page }) => { });

});
