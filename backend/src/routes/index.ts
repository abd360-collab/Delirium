import { Router } from "express";

import authRoutes from "../modules/auth/auth.routes.js";
import menuRoutes from "../modules/menu/menu.routes.js";
import cartRoutes from "../modules/cart/cart.routes.js";
import orderRoutes from "../modules/order/order.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/menu", menuRoutes);
router.use("/cart", cartRoutes);
router.use("/orders", orderRoutes);

export default router;