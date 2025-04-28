import { Router } from 'express';
import * as controller from '../controllers/session.controller';


/** Routes focused on CRUD for sessions, given a user */
const sessionRoutes = Router();

// Prefix: /sessions
sessionRoutes.get('/', controller.getSessionsController);
sessionRoutes.delete('/:id', controller.deleteSessionController);

export default sessionRoutes;