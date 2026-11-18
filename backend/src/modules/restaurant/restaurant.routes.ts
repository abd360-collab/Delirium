
import { Router } from "express";

import {
    getRestaurant,
    updateRestaurant,
} from "./restaurant.controller.js";

import { requireAuth } from "../../shared/middlewares/auth.middleware.js";
import { requireRole } from "../../shared/middlewares/authorization.middleware.js";

const router = Router();

// Public: customers need restaurant details.
router.get(
    "/",
    getRestaurant,
);

// Admin-only: update restaurant settings.
router.patch(
    "/",
    requireAuth,
    requireRole("ADMIN"),
    updateRestaurant,
);

export default router;
