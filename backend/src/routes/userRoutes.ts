import express from 'express';
import * as userController from '../controllers/userController';

const router = express.Router();

// signup route
router.post('/signup', userController.signup);

// login route
router.post('/login', userController.login);


export default router;