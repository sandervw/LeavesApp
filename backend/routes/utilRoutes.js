import express from "express";

import utilController from "../controllers/utilController.js";

const router = express.Router();

// Export all structure prompts to a json file
router.post('/export', utilController.exportStructures);

// Import structure prompts from a json file
router.post('/import', utilController.importStructures);

// Convert all prompts to promptchains
router.post('/convertPrompts', utilController.convertPrompts);

// get responses from AI with precursor conversation
router.post('/precursorResponse', utilController.precursorAIResponses);

export default router;