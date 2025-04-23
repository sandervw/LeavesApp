import express from "express";
import templateController from "../controllers/templateController";
import requireAuth from "../middleware/requireAuth";

const router = express.Router();

// Protect all routes after this middleware
router.use(requireAuth);

router.get('/', templateController.get);

router.get('/:id', templateController.getById);

router.get('/getchildren/:id', templateController.getChildren);

router.post('/', templateController.post);

router.delete('/:id', templateController.deleteById);

export default router;