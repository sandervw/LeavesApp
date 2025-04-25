import { Router } from 'express';
import { signup, login, logout, refresh } from '../controllers/user.controller';

const userRoutes = Router();

userRoutes.post('/signup', signup);
userRoutes.post('/login', login);
userRoutes.get('/logout', logout);
userRoutes.get('/refresh', refresh);


export default userRoutes;