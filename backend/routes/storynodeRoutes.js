import express from "express";
import storynodeController from "../controllers/storynodeController.js";
import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

// Protect all routes after this middleware
router.use(requireAuth);

router.get('/', storynodeController.get);

router.get('/:id', storynodeController.getById);

router.get('/getchildren/:id', storynodeController.getChildren);

router.post('/', storynodeController.post);

router.delete('/:id', storynodeController.deleteById);

router.post('/postfromtemplate/', storynodeController.postFromTemplate);

router.post('/postfromfile/', storynodeController.postFromFile);

router.post('/posttofile/', storynodeController.postToFile);

export default router;