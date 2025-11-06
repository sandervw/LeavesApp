import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../../src/app';
import { createAuthenticatedUser, createStorynodeTree, createTemplateTree } from '../helpers';
import { Storynode } from '../../../src/models/tree.model';


describe('Storynode Controller Tests', () => {

  beforeEach(async () => {
    // Clear all collections before each test
    await mongoose.connection.dropDatabase();
  });

  describe('Get Storynodes', () => {
    it('Should return all storynodes for authenticated user', async () => {
      const { cookies, userId } = await createAuthenticatedUser();
      await createStorynodeTree(userId);

      const response = await request(app)
        .get('/storynode')
        .set('Cookie', cookies)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(3);
    });
  });

  describe('Get One Storynode', () => {
    it('Should return a single storynode by ID for authenticated user', async () => {
      const { cookies, userId } = await createAuthenticatedUser();
      const { root } = await createStorynodeTree(userId);

      const response = await request(app)
        .get(`/storynode/${root._id}`)
        .set('Cookie', cookies)
        .expect(200);

      expect(response.body._id).toBe(root._id.toString());
      expect(response.body.name).toBe(root.name);
    });

    it('Should return NOT_FOUND for a non-existent storynode', async () => {
      const { cookies } = await createAuthenticatedUser();
      const fakeId = new mongoose.Types.ObjectId();

      await request(app)
        .get(`/storynode/${fakeId}`)
        .set('Cookie', cookies)
        .expect(404);
    });

    it('Should return NOT_FOUND when attempting to access another user\'s storynode', async () => {
      const { cookies } = await createAuthenticatedUser('user1@example.com', 'Password123!', 'user1');
      const user2 = await createAuthenticatedUser('user2@example.com', 'Password123!', 'user2');
      const { root } = await createStorynodeTree(user2.userId);

      await request(app)
        .get(`/storynode/${root._id}`)
        .set('Cookie', cookies)
        .expect(404);
    });
  });

  describe('Get Storynode Children', () => {
    it('Should return all children of a storynode', async () => {
      const { cookies, userId } = await createAuthenticatedUser();
      const { root, branch } = await createStorynodeTree(userId);

      const response = await request(app)
        .get(`/storynode/getchildren/${root._id}`)
        .set('Cookie', cookies)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(1);
      expect(response.body[0]._id).toBe(branch._id.toString());
    });

    it('Should return NOT_FOUND if parent storynode does not exist', async () => {
      const { cookies } = await createAuthenticatedUser();
      const fakeId = new mongoose.Types.ObjectId();

      await request(app)
        .get(`/storynode/getchildren/${fakeId}`)
        .set('Cookie', cookies)
        .expect(404);
    });
  });

  describe('Post Storynode (Upsert)', () => {
    it('Should create a new storynode with valid data and calculate word count from text', async () => {
      const { cookies } = await createAuthenticatedUser();

      const response = await request(app)
        .post('/storynode')
        .set('Cookie', cookies)
        .send({
          name: 'New Story',
          type: 'root',
          text: 'This is a test story with eight words',
          isComplete: false,
          archived: false
        })
        .expect(201);

      expect(response.body.name).toBe('New Story');
      expect(response.body.wordCount).toBe(8);
    });

    it('Should update an existing storynode with valid data', async () => {
      const { cookies, userId } = await createAuthenticatedUser();
      const { root } = await createStorynodeTree(userId);

      const response = await request(app)
        .post('/storynode')
        .set('Cookie', cookies)
        .send({
          _id: root._id.toString(),
          name: 'Updated Story',
          type: 'root',
          text: 'Updated text with three words',
          isComplete: true,
          archived: false
        })
        .expect(201);

      expect(response.body.name).toBe('Updated Story');
      expect(response.body.wordCount).toBe(5);
    });

    it('Should update parent word counts when creating/updating a storynode with parent', async () => {
      const { cookies, userId } = await createAuthenticatedUser();
      const { root } = await createStorynodeTree(userId);

      // Create a child with specific word count
      const childResponse = await request(app)
        .post('/storynode')
        .set('Cookie', cookies)
        .send({
          name: 'Child Story',
          type: 'leaf',
          text: 'Ten words in this child story node for testing purposes',
          parent: root._id.toString(),
          isComplete: false,
          archived: false
        })
        .expect(201);

      expect(childResponse.body.wordCount).toBe(10);

      // Verify parent word count was updated
      const updatedRoot = await Storynode.findById(root._id);
      expect(updatedRoot?.wordCount).toBeGreaterThan(0);
    });

    it('Should return BAD_REQUEST for invalid data', async () => {
      const { cookies } = await createAuthenticatedUser();

      await request(app)
        .post('/storynode')
        .set('Cookie', cookies)
        .send({
          name: 'Story',
          // missing required 'type' field
          text: 'text'
        })
        .expect(400);
    });
  });

  describe('Delete Storynode', () => {
    it('Should delete a storynode and all its descendants', async () => {
      const { cookies, userId } = await createAuthenticatedUser();
      const { root, branch, leaf } = await createStorynodeTree(userId);

      await request(app)
        .delete(`/storynode/${root._id}`)
        .set('Cookie', cookies)
        .expect(200);

      const deletedRoot = await Storynode.findById(root._id);
      const deletedBranch = await Storynode.findById(branch._id);
      const deletedLeaf = await Storynode.findById(leaf._id);

      expect(deletedRoot).toBeNull();
      expect(deletedBranch).toBeNull();
      expect(deletedLeaf).toBeNull();
    });

    it('Should remove reference from parent storynode after deletion', async () => {
      const { cookies, userId } = await createAuthenticatedUser();
      const { root, branch } = await createStorynodeTree(userId);

      await request(app)
        .delete(`/storynode/${branch._id}`)
        .set('Cookie', cookies)
        .expect(200);

      const updatedRoot = await Storynode.findById(root._id);
      expect(updatedRoot?.children).toHaveLength(0);
    });

    it('Should return NOT_FOUND for a non-existent storynode', async () => {
      const { cookies } = await createAuthenticatedUser();
      const fakeId = new mongoose.Types.ObjectId();

      await request(app)
        .delete(`/storynode/${fakeId}`)
        .set('Cookie', cookies)
        .expect(404);
    });
  });

  describe('Post From Template', () => {
    it('Should create a new storynode tree from a template without parentId', async () => {
      const { cookies, userId } = await createAuthenticatedUser();
      const { root: template } = await createTemplateTree(userId);

      const response = await request(app)
        .post('/storynode/postfromtemplate')
        .set('Cookie', cookies)
        .send({
          templateId: template._id.toString()
        })
        .expect(201);

      expect(response.body.name).toBe(template.name);
      expect(response.body.kind).toBe('storynode');
    });

    it('Should create a new storynode tree from a template with parentId', async () => {
      const { cookies, userId } = await createAuthenticatedUser();
      const { root: template } = await createTemplateTree(userId, 'Template');
      const { root: parentStory } = await createStorynodeTree(userId, 'Story');

      const response = await request(app)
        .post('/storynode/postfromtemplate')
        .set('Cookie', cookies)
        .send({
          templateId: template._id.toString(),
          parentId: parentStory._id.toString()
        })
        .expect(201);

      expect(response.body.name).toBe(template.name);

      // Verify parent was updated with new child
      const updatedParent = await Storynode.findById(parentStory._id);
      expect(updatedParent?.children).toContain(response.body._id);
    });

    it('Should return NOT_FOUND for a non-existent template', async () => {
      const { cookies } = await createAuthenticatedUser();
      const fakeId = new mongoose.Types.ObjectId();

      await request(app)
        .post('/storynode/postfromtemplate')
        .set('Cookie', cookies)
        .send({
          templateId: fakeId.toString()
        })
        .expect(404);
    });

    it('Should return NOT_FOUND for a non-existent parent storynode', async () => {
      const { cookies, userId } = await createAuthenticatedUser();
      const { root: template } = await createTemplateTree(userId);
      const fakeParentId = new mongoose.Types.ObjectId();

      await request(app)
        .post('/storynode/postfromtemplate')
        .set('Cookie', cookies)
        .send({
          templateId: template._id.toString(),
          parentId: fakeParentId.toString()
        })
        .expect(404);
    });
  });

});