import express from "express";
import templateController from "../controllers/templateController.js";

const router = express.Router();

router.get('/', templateController.get);

router.get('/:id', templateController.getById);

router.get('/getchildren/:id', templateController.getChildren);

router.post('/', templateController.post);

router.delete('/:id', templateController.deleteById);

export default router;