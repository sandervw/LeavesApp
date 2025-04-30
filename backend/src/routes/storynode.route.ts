import express from 'express';
import * as controller from '../controllers/storynode.controller';

/** Routes focused on CRUD for storynodes */
const router = express.Router();

// Prefix: /storynodes
router.get('/', controller.getStorynodesController);
router.get('/:id', controller.getOneStorynodeController);
router.get('/getchildren/:id', controller.getStorynodeChildrenController);
router.post('/', controller.postStorynodeController);
router.delete('/:id', controller.deleteStorynodeController);
router.post('/postfromstorynode/', controller.postFromTemplateController);
router.post('/postfromfile/', controller.postFromFileController);
router.post('/posttofile/', controller.postToFileController);

export default router;