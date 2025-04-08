import express from "express";
import userController from "../controllers/userController.js";

const router = express.Router();


// signup route
router.post('/signup', userController.signup);

// login route
router.post('/login', userController.login);


export default router;