import { Router } from 'express';
import * as userController from '../controllers/user.controller';

const userRoutes = Router();

// signup route
userRoutes.post('/signup', userController.signup);

// login route
//userRoutes.post('/login', userController.login);


export default userRoutes;