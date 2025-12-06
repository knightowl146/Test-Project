import { Router } from "express";
import {
    getAllUsers,
    createUser,
    deleteUser
} from "../../controllers/admin/users.controller.js";
import { verifyJWT, authorizeRoles } from "../../middlewares/auth.middleware.js";

const router = Router();

// All routes are protected and admin-only
router.use(verifyJWT);
router.use(authorizeRoles("admin"));

router.route("/")
    .get(getAllUsers)
    .post(createUser);

router.route("/:id")
    .delete(deleteUser);

export default router;
