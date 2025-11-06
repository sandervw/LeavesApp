import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../../src/app';
import { createAuthenticatedUser, createTemplateTree } from '../helpers';
import { Template } from '../../../src/models/tree.model';


describe('Template Controller Tests', () => {

  beforeEach(async () => {
    // Clear all collections before each test
    await mongoose.connection.dropDatabase();
  });

  describe('Get Templates', () => {
    it('Should return all templates for authenticated user', async () => {
      const { cookies, userId } = await createAuthenticatedUser();
      await createTemplateTree(userId);

      const response = await request(app)
        .get('/template')
        .set('Cookie', cookies)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(3);
    });
  });

  describe('Get One Template', () => {
    it('Should return a single template by ID for authenticated user', async () => {
      const { cookies, userId } = await createAuthenticatedUser();
      const { root } = await createTemplateTree(userId);

      const response = await request(app)
        .get(`/template/${root._id}`)
        .set('Cookie', cookies)
        .expect(200);

      expect(response.body._id).toBe(root._id.toString());
      expect(response.body.name).toBe(root.name);
    });

    it('Should return NOT_FOUND for a non-existent template', async () => {
      const { cookies } = await createAuthenticatedUser();
      const fakeId = new mongoose.Types.ObjectId();

      await request(app)
        .get(`/template/${fakeId}`)
        .set('Cookie', cookies)
        .expect(404);
    });

    it('Should return NOT_FOUND when attempting to access another user\'s template', async () => {
      const { cookies } = await createAuthenticatedUser('user1@example.com', 'Password123!', 'user1');
      const user2 = await createAuthenticatedUser('user2@example.com', 'Password123!', 'user2');
      const { root } = await createTemplateTree(user2.userId);

      await request(app)
        .get(`/template/${root._id}`)
        .set('Cookie', cookies)
        .expect(404);
    });
  });

  describe('Get Template Children', () => {
    it('Should return all children of a template', async () => {
      const { cookies, userId } = await createAuthenticatedUser();
      const { root, branch } = await createTemplateTree(userId);

      const response = await request(app)
        .get(`/template/getchildren/${root._id}`)
        .set('Cookie', cookies)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(1);
      expect(response.body[0]._id).toBe(branch._id.toString());
    });

    it('Should return NOT_FOUND if parent template does not exist', async () => {
      const { cookies } = await createAuthenticatedUser();
      const fakeId = new mongoose.Types.ObjectId();

      await request(app)
        .get(`/template/getchildren/${fakeId}`)
        .set('Cookie', cookies)
        .expect(404);
    });
  });

  describe('Post Template (Upsert)', () => {
    it('Should create a new template with valid data', async () => {
      const { cookies } = await createAuthenticatedUser();

      const response = await request(app)
        .post('/template')
        .set('Cookie', cookies)
        .send({
          name: 'New Template',
          type: 'root',
          text: 'Template text',
          wordWeight: 100
        })
        .expect(201);

      expect(response.body.name).toBe('New Template');
      expect(response.body.type).toBe('root');
    });

    it('Should update an existing template with valid data', async () => {
      const { cookies, userId } = await createAuthenticatedUser();
      const { root } = await createTemplateTree(userId);

      const response = await request(app)
        .post('/template')
        .set('Cookie', cookies)
        .send({
          _id: root._id.toString(),
          name: 'Updated Template',
          type: 'root',
          text: 'Updated text',
          wordWeight: 150
        })
        .expect(201);

      expect(response.body.name).toBe('Updated Template');
      expect(response.body.text).toBe('Updated text');
    });

    it('Should return BAD_REQUEST for invalid data', async () => {
      const { cookies } = await createAuthenticatedUser();

      await request(app)
        .post('/template')
        .set('Cookie', cookies)
        .send({
          name: 'Template',
          // missing required 'type' field
          text: 'text'
        })
        .expect(400);
    });
  });

  describe('Delete Template', () => {
    it('Should delete a template and all its descendants', async () => {
      const { cookies, userId } = await createAuthenticatedUser();
      const { root, branch, leaf } = await createTemplateTree(userId);

      await request(app)
        .delete(`/template/${root._id}`)
        .set('Cookie', cookies)
        .expect(200);

      const deletedRoot = await Template.findById(root._id);
      const deletedBranch = await Template.findById(branch._id);
      const deletedLeaf = await Template.findById(leaf._id);

      expect(deletedRoot).toBeNull();
      expect(deletedBranch).toBeNull();
      expect(deletedLeaf).toBeNull();
    });

    it('Should remove reference from parent template after deletion', async () => {
      const { cookies, userId } = await createAuthenticatedUser();
      const { root, branch } = await createTemplateTree(userId);

      await request(app)
        .delete(`/template/${branch._id}`)
        .set('Cookie', cookies)
        .expect(200);

      const updatedRoot = await Template.findById(root._id);
      expect(updatedRoot?.children).toHaveLength(0);
    });

    it('Should return NOT_FOUND for a non-existent template', async () => {
      const { cookies } = await createAuthenticatedUser();
      const fakeId = new mongoose.Types.ObjectId();

      await request(app)
        .delete(`/template/${fakeId}`)
        .set('Cookie', cookies)
        .expect(404);
    });
  });

});