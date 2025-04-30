import { OK } from '../constants/http';
import storynodeService from '../services/storynode.service';
import { catchErrors } from '../utils/errorUtils';
import { mongoIdSchema } from '../schemas/controller.schema';
import { StorynodeDoc } from '../schemas/mongo.schema';

export const getStorynodesController = catchErrors( async (req, res) => {
    const storynodes = await storynodeService.find(req.userId, req.query);
    return res.status(OK).json(storynodes);
});

export const getOneStorynodeController = catchErrors( async (req, res) => {
    const storynodeId = mongoIdSchema.parse(req.params.id);
    const storynode = await storynodeService.findById(req.userId, storynodeId);
    return res.status(OK).json(storynode);
});
    
export const getStorynodeChildrenController = catchErrors( async (req, res) => {
    const storynodeId = mongoIdSchema.parse(req.params.id);
    const children = await storynodeService.findChildren(req.userId, storynodeId);
    return res.status(OK).json(children);
});
    
export const postStorynodeController = catchErrors( async (req, res) => {
    const storynode: StorynodeDoc = req.body;
    const result = await storynodeService.upsert(req.userId, storynode);
    return res.status(OK).json(result);
});
    
export const deleteStorynodeController = catchErrors( async (req, res) => {
    const storynodeId = mongoIdSchema.parse(req.params.id);
    const result = await storynodeService.deleteById(req.userId, storynodeId);
    return res.status(OK).json(result);
}); 

export const postFromTemplateController = catchErrors( async (req, res) => {
    // TODO
});

export const postFromFileController = catchErrors( async (req, res) => {
    // TODO
});

export const postToFileController = catchErrors( async (req, res) => {
    // TODO
});