import { Router } from 'express';
import { signup, login, logout, refresh, verify } from '../controllers/user.controller';

const userRoutes = Router();

userRoutes.post('/signup', signup);
userRoutes.post('/login', login);
userRoutes.get('/logout', logout);
userRoutes.get('/refresh', refresh);
userRoutes.get('/email/verify/:code', verify);


export default userRoutes;