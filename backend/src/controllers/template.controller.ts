import { OK } from '../constants/http';
import templateService from '../services/template.service';
import { catchErrors } from '../utils/errorUtils';
import { mongoIdSchema } from '../schemas/controller.schema';

export const getTemplatesController = catchErrors( async (req, res) => {
    const request = { userId: req.userId, query: req.query };
    const templates = await templateService.find( request );
    return res.status(OK).json(templates);
});

export const getOneTemplateController = catchErrors( async (req, res) => {
    const templateId = mongoIdSchema.parse(req.params.id);
    const request = { userId: req.userId, id: templateId };
    const template = await templateService.findById(request);
    return res.status(OK).json(template);
});
    
export const getTemplateChildrenController = catchErrors( async (req, res) => {
    const templateId = mongoIdSchema.parse(req.params.id);
    const request = { userId: req.userId, id: templateId };
    const children = await templateService.findChildren(request);
    return res.status(OK).json(children);
});
    
export const postTemplateController = catchErrors( async (req, res) => {
    const template: TemplateDoc = req.body;
});
    
export const deleteTemplateController = catchErrors( async (req, res) => {
    // try {
    //     const user_id = req.user._id;
    //     const result = await templateService.deleteById(req.params.id, user_id);
    //     res.status(200).json(result);
    // } catch (err) {
    //     console.log(err);
    //     res.status(404).json({ error: err.message });
    // }
}); 
