import { CREATED, OK } from '../constants/http';
import StorynodeService from '../services/storynode.service';
import { catchErrors } from '../utils/errorUtils';
import { mongoIdSchema, optionalMongoIdSchema, postSchema } from '../schemas/controller.schema';

/**
 * Retrieves all storynodes for the current user with optional query filters.
 */
export const getStorynodesController = catchErrors(async (req, res) => {
  const storynodes = await StorynodeService.find(req.userId, req.query);
  return res.status(OK).json(storynodes);
});

/**
 * Retrieves a single storynode by ID for the current user.
 */
export const getOneStorynodeController = catchErrors(async (req, res) => {
  const storynodeId = mongoIdSchema.parse(req.params.id);
  const storynode = await StorynodeService.findById(req.userId, storynodeId);
  return res.status(OK).json(storynode);
});

/**
 * Retrieves all children of a specific storynode for the current user.
 */
export const getStorynodeChildrenController = catchErrors(async (req, res) => {
  const storynodeId = mongoIdSchema.parse(req.params.id);
  const children = await StorynodeService.findChildren(req.userId, storynodeId);
  return res.status(OK).json(children);
});

/**
 * Creates or updates a storynode for the current user.
 */
export const postStorynodeController = catchErrors(async (req, res) => {
  postSchema.parse(req.body); // Validate the request.
  const result = await StorynodeService.upsert(req.userId, req.body);
  return res.status(CREATED).json(result);
});

/**
 * Deletes a storynode by ID for the current user.
 */
export const deleteStorynodeController = catchErrors(async (req, res) => {
  const storynodeId = mongoIdSchema.parse(req.params.id);
  const result = await StorynodeService.deleteById(req.userId, storynodeId);
  return res.status(OK).json(result);
});

/**
 * Creates a new storynode tree from a template for the current user.
 */
export const postFromTemplateController = catchErrors(async (req, res) => {
  const templateId = mongoIdSchema.parse(req.body.templateId);
  const parentId = optionalMongoIdSchema.parse(req.body.parentId);
  const newTree = await StorynodeService.addFromTemplate(req.userId, templateId, parentId);
  return res.status(CREATED).json(newTree);
});

// TODO: Implement the following controllers when needed.
// export const patchDepthController = catchErrors(async (req, res) => {
//   const result = await storynodeService.updateDepth(req.userId);
//   return res.status(OK).json(result);
// });

// export const postToFileController = catchErrors(async (req, res) => {
//     // TODO
// });

// export const postFromFileController = catchErrors(async (req, res) => {
//     // TODO
// });