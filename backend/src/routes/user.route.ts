import { Router } from 'express';
import * as controller from '../controllers/user.controller';

const userRoutes = Router();

userRoutes.post('/signup', controller.signupController);
userRoutes.post('/login', controller.loginController);
userRoutes.get('/logout', controller.logoutController);
userRoutes.get('/refresh', controller.refreshController);
userRoutes.get('/email/verify/:code', controller.verifyController);
userRoutes.post('/password/forgot', controller.forgotPasswordController);
userRoutes.post('/password/reset', controller.forgotPasswordController);


export default userRoutes;