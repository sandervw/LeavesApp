import { Router } from 'express';
import * as controller from '../controllers/auth.controller';

const authRoutes = Router();

authRoutes.post('/signup', controller.signupController);
authRoutes.post('/login', controller.loginController);
authRoutes.get('/logout', controller.logoutController);
authRoutes.get('/refresh', controller.refreshController);
authRoutes.get('/email/verify/:code', controller.verifyController);
authRoutes.post('/password/forgot', controller.forgotPasswordController);
authRoutes.post('/password/reset', controller.resetPasswordController);


export default authRoutes;