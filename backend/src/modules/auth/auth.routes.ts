import { Router } from "express";
import { getMe, login, logout, logoutAll, refresh, register } from "./auth.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/authorization.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.post(
    "/logout-all",
    requireAuth,
    logoutAll,
);
router.get(
    "/me",
    requireAuth,
    getMe,
);


export default router;