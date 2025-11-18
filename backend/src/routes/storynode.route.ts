import express from 'express';
import * as controller from '../controllers/storynode.controller';

/** Routes focused on CRUD for storynodes */
const storynodeRoutes = express.Router();

// Prefix: /storynode
storynodeRoutes.get('/', controller.getStorynodesController);
storynodeRoutes.get('/:id', controller.getOneStorynodeController);
storynodeRoutes.get('/getchildren/:id', controller.getStorynodeChildrenController);
storynodeRoutes.get('/getstoryfile/:id', controller.getStoryFileController);
storynodeRoutes.post('/', controller.postStorynodeController);
storynodeRoutes.delete('/:id', controller.deleteStorynodeController);
storynodeRoutes.post('/postfromtemplate/', controller.postFromTemplateController);

export default storynodeRoutes;