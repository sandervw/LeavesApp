import express from 'express';
import * as controller from '../controllers/template.controller';

/** Routes focused on CRUD for templates */
const router = express.Router();

// Prefix: /template
router.get('/', controller.getTemplatesController);
router.get('/:id', controller.getOneTemplateController);
router.get('/getchildren/:id', controller.getTemplateChildrenController);
router.post('/', controller.postTemplateController);
router.delete('/:id', controller.deleteTemplateController);

export default router;