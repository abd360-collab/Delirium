import { Router } from "express";

import { paymentController } from "./payment.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";

const router = Router();

router.post(
    "/orders/:orderId/payment",
    requireAuth,
    paymentController.initiatePayment,
);

export default router;