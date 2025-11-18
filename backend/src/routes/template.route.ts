import express from 'express';
import * as controller from '../controllers/template.controller';

/** Routes focused on CRUD for templates */
const templateRoutes = express.Router();

// Prefix: /template
templateRoutes.get('/', controller.getTemplatesController);
templateRoutes.get('/:id', controller.getOneTemplateController);
templateRoutes.get('/getchildren/:id', controller.getTemplateChildrenController);
templateRoutes.post('/', controller.postTemplateController);
templateRoutes.delete('/:id', controller.deleteTemplateController);

export default templateRoutes;