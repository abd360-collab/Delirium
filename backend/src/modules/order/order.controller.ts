import type { Request, Response } from "express";

import { orderService } from "./order.service.js";
import {
    createOrderSchema,
    updateOrderStatusSchema,
} from "./order.schema.js";

import { getRequiredParam } from "../../lib/requestParams.js";


export async function createOrder(
    req: Request,
    res: Response,
) {
    const order = await orderService.createOrder(
        req.user!.id,
    );

    return res.status(201).json({
        success: true,
        data: {
            order,
        },
    });
}


export async function getOrders(
    req: Request,
    res: Response,
) {
    const orders = await orderService.getOrders(
        req.user!.id,
    );

    return res.status(200).json({
        success: true,
        data: {
            orders,
        },
    });
}


export async function getOrderById(
    req: Request,
    res: Response,
) {
    const order = await orderService.getOrderById(
        req.user!.id,
        req.params.id as string,
    );

    return res.status(200).json({
        success: true,
        data: {
            order,
        },
    });
}

export async function updateOrderStatus(
    req: Request,
    res: Response,
) {
    const input = updateOrderStatusSchema.parse(req.body);

    const orderId = getRequiredParam(
        req.params.id,
        "id",
    );

    const order = await orderService.updateOrderStatus(
        orderId,
        input.status,
    );

    return res.status(200).json({
        success: true,
        data: {
            order,
        },
    });
}