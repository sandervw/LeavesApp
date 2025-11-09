import { CREATED, OK } from '../constants/http';
import TemplateService from '../services/template.service';
import { catchErrors } from '../utils/errorUtils';
import { mongoIdSchema, postSchema } from '../schemas/controller.schema';

/**
 * Retrieves all templates for the current user with optional query filters.
 */
export const getTemplatesController = catchErrors(async (req, res) => {
    const templates = await TemplateService.find(req.userId, req.query);
    return res.status(OK).json(templates);
});

/**
 * Retrieves a single template by ID for the current user.
 */
export const getOneTemplateController = catchErrors(async (req, res) => {
    const templateId = mongoIdSchema.parse(req.params.id);
    const template = await TemplateService.findById(req.userId, templateId);
    return res.status(OK).json(template);
});

/**
 * Retrieves all children of a specific template for the current user.
 */
export const getTemplateChildrenController = catchErrors(async (req, res) => {
    const templateId = mongoIdSchema.parse(req.params.id);
    const children = await TemplateService.findChildren(req.userId, templateId);
    return res.status(OK).json(children);
});

/**
 * Creates or updates a template for the current user.
 */
export const postTemplateController = catchErrors(async (req, res) => {
    postSchema.parse(req.body); // Validate the request.
    const result = await TemplateService.upsert(req.userId, req.body);
    return res.status(CREATED).json(result);
});

/**
 * Deletes a template by ID for the current user.
 */
export const deleteTemplateController = catchErrors(async (req, res) => {
    const templateId = mongoIdSchema.parse(req.params.id);
    const result = await TemplateService.deleteById(req.userId, templateId);
    return res.status(OK).json(result);
}); 
