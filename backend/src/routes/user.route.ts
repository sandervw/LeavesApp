import { Router } from 'express';
import { signup, login } from '../controllers/user.controller';

const userRoutes = Router();

// signup route
userRoutes.post('/signup', signup);
userRoutes.post('/login', login);


export default userRoutes;