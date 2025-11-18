/** *auth.route.ts */
// total size: 519 chars
import { Router } from 'express';
import * as controller from '../controllers/auth.controller';
import { authLimiter } from '../config/security';

declare const authRoutes: Router;
export default authRoutes;

/** *user.route.ts */
// total size: 261 chars
import { Router } from "express";
import * as controller from "../controllers/user.controller";

declare const userRoutes: Router;
export default userRoutes;

/** *template.route.ts */
// total size: 436 chars
import express from 'express';
import * as controller from '../controllers/template.controller';

declare const router: express.Router;
export default router;

/** *storynode.route.ts */
// total size: 685 chars
import express from 'express';
import * as controller from '../controllers/storynode.controller';

declare const router: express.Router;
export default router;

/** *session.route.ts */
// total size: 385 chars
import { Router } from 'express';
import * as controller from '../controllers/session.controller';

declare const sessionRoutes: Router;
export default sessionRoutes;

/** *test.route.ts */
// total size: 262 chars
import { Router } from 'express';
import { clearDatabaseHandler } from '../controllers/test.controller';

declare const testRoutes: Router;
export default testRoutes;
