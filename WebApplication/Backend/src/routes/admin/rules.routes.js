import { Router } from "express";
import {
    createRule,
    getRules,
    updateRule,
    deleteRule,
    toggleRuleStatus
} from "../../controllers/admin/rules.controller.js";
import { verifyJWT, authorizeRoles } from "../../middlewares/auth.middleware.js";

const router = Router();

// All routes are protected and admin-only
router.use(verifyJWT);
router.use(authorizeRoles("admin"));

router.route("/")
    .get(getRules)
    .post(createRule);

router.route("/:id")
    .put(updateRule)
    .delete(deleteRule);

router.route("/:id/toggle")
    .patch(toggleRuleStatus);

export default router;
