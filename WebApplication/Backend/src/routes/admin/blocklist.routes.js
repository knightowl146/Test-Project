import { Router } from "express";
import {
    getBlocklist,
    addBlock,
    removeBlock
} from "../../controllers/admin/blocklist.controller.js";
import { verifyJWT, authorizeRoles } from "../../middlewares/auth.middleware.js";

const router = Router();

// All routes are protected and admin-only
router.use(verifyJWT);
router.use(authorizeRoles("admin"));

router.route("/")
    .get(getBlocklist)
    .post(addBlock);

router.route("/:id")
    .delete(removeBlock);

export default router;
