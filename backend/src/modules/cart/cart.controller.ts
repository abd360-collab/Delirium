import type { Request, Response } from "express";

import {
    addCartItemSchema,
    updateCartItemSchema,
} from "./cart.schema.js";

import { cartService } from "./cart.service.js";


export async function getCart(
    req: Request,
    res: Response,
) {
    const cart = await cartService.getCart(req.user!.id);

    return res.status(200).json({
        success: true,
        data: {
            cart,
        },
    });
}


export async function addCartItem(
    req: Request,
    res: Response,
) {
    const input = addCartItemSchema.parse(req.body);

    const cartItem = await cartService.addItem(
        req.user!.id,
        input,
    );

    return res.status(201).json({
        success: true,
        data: {
            cartItem,
        },
    });
}


export async function updateCartItem(
    req: Request,
    res: Response,
) {
    const input = updateCartItemSchema.parse(req.body);

    const cartItem = await cartService.updateItem(
        req.user!.id,
        req.params.id as string,
        input,
    );

    return res.status(200).json({
        success: true,
        data: {
            cartItem,
        },
    });
}


export async function removeCartItem(
    req: Request,
    res: Response,
) {
    await cartService.removeItem(
        req.user!.id,
        req.params.id as string,
    );

    return res.status(204).send();
}


export async function clearCart(
    req: Request,
    res: Response,
) {
    await cartService.clearCart(req.user!.id);

    return res.status(204).send();
}