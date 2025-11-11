import request from 'supertest';
import { app } from '../../src/app';
import { Template, Storynode } from '../../src/models/tree.model';
import mongoose from 'mongoose';

/**
 * Creates an authenticated user and returns cookies for making authenticated requests
 */
export const createAuthenticatedUser = async (email = 'test@example.com', password = 'Password123!', username = 'testuser') => {
  const response = await request(app)
    .post('/auth/signup')
    .send({ email, password, username });

  return {
    cookies: response.headers['set-cookie'],
    userId: response.body._id,
    user: response.body
  };
};

/**
 * Creates a template tree structure: root -> branch -> leaf
 * Returns all three templates
 */
export const createTemplateTree = async (userId: string, namePrefix = 'Template') => {
  const root = await Template.create({
    userId: new mongoose.Types.ObjectId(userId),
    name: `${namePrefix} Root`,
    type: 'root',
    text: 'Root text',
    wordWeight: 100
  });

  const branch = await Template.create({
    userId: new mongoose.Types.ObjectId(userId),
    name: `${namePrefix} Branch`,
    type: 'branch',
    text: 'Branch text',
    parent: root._id,
    depth: 1,
    wordWeight: 50
  });

  const leaf = await Template.create({
    userId: new mongoose.Types.ObjectId(userId),
    name: `${namePrefix} Leaf`,
    type: 'leaf',
    text: 'Leaf text',
    parent: branch._id,
    depth: 2,
    wordWeight: 25
  });

  // Update children arrays
  root.children = [branch._id];
  branch.children = [leaf._id];
  await root.save();
  await branch.save();

  return { root, branch, leaf };
};

/**
 * Creates a storynode tree structure: root -> branch -> leaf
 * Returns all three storynodes
 */
export const createStorynodeTree = async (userId: string, namePrefix = 'Story') => {
  const root = await Storynode.create({
    userId: new mongoose.Types.ObjectId(userId),
    name: `${namePrefix} Root`,
    type: 'root',
    text: 'Root text',
    wordCount: 2,
    wordLimit: 1000,
    isComplete: false,
    archived: false
  });

  const branch = await Storynode.create({
    userId: new mongoose.Types.ObjectId(userId),
    name: `${namePrefix} Branch`,
    type: 'branch',
    text: 'Branch text',
    parent: root._id,
    depth: 1,
    wordCount: 2,
    isComplete: false,
    archived: false
  });

  const leaf = await Storynode.create({
    userId: new mongoose.Types.ObjectId(userId),
    name: `${namePrefix} Leaf`,
    type: 'leaf',
    text: 'Leaf text',
    parent: branch._id,
    depth: 2,
    wordCount: 2,
    isComplete: false,
    archived: false
  });

  // Update children arrays
  root.children = [branch._id];
  branch.children = [leaf._id];
  await root.save();
  await branch.save();

  return { root, branch, leaf };
};
