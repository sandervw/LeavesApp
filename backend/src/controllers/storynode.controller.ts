import { CREATED, OK } from '../constants/http';
import StorynodeService from '../services/storynode.service';
import { catchErrors } from '../utils/errorUtils';
import { mongoIdSchema, optionalMongoIdSchema } from '../schemas/controller.schema';
import { createCrudControllers } from './base.controller';

/**
 * Storynode CRUD controllers.
 * Uses the factory pattern to eliminate code duplication with template.controller.ts
 */
const crud = createCrudControllers(StorynodeService);

export const getStorynodesController = crud.getAll;

export const getOneStorynodeController = crud.getOne;

export const getStorynodeChildrenController = crud.getChildren;

export const postStorynodeController = crud.create;

export const deleteStorynodeController = crud.delete;

/**
 * Creates a new storynode tree from a template for the current user.
 */
export const postFromTemplateController = catchErrors(async (req, res) => {
  const templateId = mongoIdSchema.parse(req.body.templateId);
  const parentId = optionalMongoIdSchema.parse(req.body.parentId);
  const newTree = await StorynodeService.addFromTemplate(req.userId, templateId, parentId);
  return res.status(CREATED).json(newTree);
});

/**
 * Retrieves the complete story file text from a storynode tree.
 */
export const getStoryFileController = catchErrors(async (req, res) => {
  const storynodeId = mongoIdSchema.parse(req.params.id);
  const storyText = await StorynodeService.getStoryFile(req.userId, storynodeId);
  return res.status(OK).json({ storyText });
});