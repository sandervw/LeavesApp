import { RequestHandler } from 'express';
import { CREATED, OK } from '../constants/http';
import TreeService from '../services/tree.service';
import { catchErrors } from '../utils/errorUtils';
import { mongoIdSchema, postSchema } from '../schemas/controller.schema';
import { TreeDoc } from '../schemas/mongo.schema';

/**
 * Factory function that creates standard CRUD controllers for any TreeService.
 * @param service - The TreeService instance (TemplateService or StorynodeService)
 * @returns Object containing five standard CRUD controller functions
 */
export function createCrudControllers<T extends TreeDoc>(service: TreeService<T>) {
  return {
    /**
     * Retrieves all items for the current user with optional query filters.
     */
    getAll: catchErrors(async (req, res) => {
      const items = await service.find(req.userId, req.query);
      return res.status(OK).json(items);
    }) as RequestHandler,

    /**
     * Retrieves a single item by ID for the current user.
     */
    getOne: catchErrors(async (req, res) => {
      const itemId = mongoIdSchema.parse(req.params.id);
      const item = await service.findById(req.userId, itemId);
      return res.status(OK).json(item);
    }) as RequestHandler,

    /**
     * Retrieves all children of a specific item for the current user.
     */
    getChildren: catchErrors(async (req, res) => {
      const itemId = mongoIdSchema.parse(req.params.id);
      const children = await service.findChildren(req.userId, itemId);
      return res.status(OK).json(children);
    }) as RequestHandler,

    /**
     * Creates or updates an item for the current user.
     */
    create: catchErrors(async (req, res) => {
      postSchema.parse(req.body);
      const result = await service.upsert(req.userId, req.body);
      return res.status(CREATED).json(result);
    }) as RequestHandler,

    /**
     * Deletes an item by ID for the current user.
     */
    delete: catchErrors(async (req, res) => {
      const itemId = mongoIdSchema.parse(req.params.id);
      const result = await service.deleteById(req.userId, itemId);
      return res.status(OK).json(result);
    }) as RequestHandler,
  };
}
