import { Router } from 'express';
import * as controller from '../controllers/auth.controller';
import { authLimiter } from '../config/security';


/** Routes focused on basic authentication setup (not regularly retrieving user data) */
const authRoutes = Router();

// Prefix: /auth
authRoutes.post('/signup', authLimiter, controller.signupController);
authRoutes.post('/login', authLimiter, controller.loginController);
authRoutes.get('/logout', controller.logoutController);
authRoutes.get('/refresh', controller.refreshController);
authRoutes.get('/email/verify/:code', controller.verifyController);
authRoutes.post('/password/forgot', controller.forgotPasswordController);
authRoutes.post('/password/reset', controller.resetPasswordController);


export default authRoutes;