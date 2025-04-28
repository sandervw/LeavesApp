import { Router } from "express";
import * as controller from "../controllers/user.controller";

/** Routes focused on CRUD of user information */
const userRoutes = Router();

// Prefix: /user
userRoutes.get("/", controller.getUserController);

export default userRoutes;