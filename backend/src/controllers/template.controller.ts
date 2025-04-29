import { NOT_FOUND, OK } from '../constants/http.js';
import templateService from '../services/template.service.js';
import appAssert from '../utils/appAssert.js';
import { catchErrors } from '../utils/errorUtils.js';

export const getTemplatesController = catchErrors( async (req, res) => {
    const request = { query: req.query, userId: req.userId };
    const templates = await templateService.find( request );
    return res.status(OK).json(templates);
});

export const getOneTemplateController = catchErrors( async (req, res) => {
    // try {
    //     const user_id = req.user._id;
    //     const template = await templateService.findById(req.params.id, user_id);
    //     return res.status(200).json(template);
    // } catch (err) {
    //     console.log(err);
    //     res.status(404).json({ error: err.message });
    // }
});
    
export const getTemplateChildrenController = catchErrors( async (req, res) => {
    // try {
    //     const user_id = req.user._id;
    //     const children = await templateService.findChildren(req.params.id, user_id);
    //     res.status(200).json(children);
    // } catch (err) {
    //     console.log(err);
    //     res.status(404).json({ error: err.message });
    // }
});
    
export const postTemplateController = catchErrors( async (req, res) => {
    // try {
    //     const user_id = req.user._id;
    //     const result = await templateService.upsert(req.body, user_id);
    //     res.status(200).json(result);
    // } catch (err) {
    //     console.log(err);
    //     res.status(404).json({ error: err.message });
    // }
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
