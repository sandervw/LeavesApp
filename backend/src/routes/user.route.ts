import { Router } from 'express';
import { signup, login, logout } from '../controllers/user.controller';

const userRoutes = Router();

// signup route
userRoutes.post('/signup', signup);
userRoutes.post('/login', login);
userRoutes.post('/logout', logout);

export default userRoutes;