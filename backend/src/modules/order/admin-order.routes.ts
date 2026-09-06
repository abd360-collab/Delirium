import { Router } from "express";

import { requireAuth } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/authorization.middleware.js";
import { updateOrderStatus } from "./order.controller.js";

const router = Router();

router.patch(
    "/:id/status",
    requireAuth,
    requireRole("ADMIN"),
    updateOrderStatus,
);

export default router;