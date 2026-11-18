import { Router } from "express";

import { paymentController } from "./payment.controller.js";
import { requireAuth } from "../../shared/middlewares/auth.middleware.js";

const router = Router();

router.post(
    "/order/:orderId",
    requireAuth,
    paymentController.initiatePayment,
);

router.post(
    "/verify",
    requireAuth,
    paymentController.verifyPayment,
);

export default router;