import ruleRouter from "./admin/rules.routes.js";
import blocklistRouter from "./admin/blocklist.routes.js";
import userRouter from "./admin/users.routes.js";
import express from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/auth.middleware.js';
import { getSystemHealth } from '../controllers/admin.controller.js';

const router = express.Router();

// Protect all admin routes
router.use(verifyJWT);
router.use(authorizeRoles("admin"));

// Overview
router.route("/health").get(getSystemHealth);

// Modules
router.use("/rules", ruleRouter);
router.use("/blocklist", blocklistRouter);
router.use("/users", userRouter);

export default router;
