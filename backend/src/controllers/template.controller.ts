import { CREATED, OK } from '../constants/http';
import templateService from '../services/template.service';
import { catchErrors } from '../utils/errorUtils';
import { mongoIdSchema, postSchema } from '../schemas/controller.schema';
import { TemplateDoc } from '../schemas/mongo.schema';

export const getTemplatesController = catchErrors( async (req, res) => {
    const templates = await templateService.find(req.userId, req.query);
    return res.status(OK).json(templates);
});

export const getOneTemplateController = catchErrors( async (req, res) => {
    const templateId = mongoIdSchema.parse(req.params.id);
    const template = await templateService.findById(req.userId, templateId);
    return res.status(OK).json(template);
});
    
export const getTemplateChildrenController = catchErrors( async (req, res) => {
    const templateId = mongoIdSchema.parse(req.params.id);
    const children = await templateService.findChildren(req.userId, templateId);
    return res.status(OK).json(children);
});
    
export const postTemplateController = catchErrors( async (req, res) => {
    postSchema.parse(req.body); // Validate the request
    const result = await templateService.upsert(req.userId, req.body);
    return res.status(CREATED).json(result);
});
    
export const deleteTemplateController = catchErrors( async (req, res) => {
    const templateId = mongoIdSchema.parse(req.params.id);
    const result = await templateService.deleteById(req.userId, templateId);
    return res.status(OK).json(result);
}); 
