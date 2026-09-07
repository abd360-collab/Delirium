import { prisma } from "../../lib/prisma.js";

import { AppError } from "../../errors/AppError.js";
import { ERROR_CODES } from "../../errors/errorCodes.js";

import { cartRepository } from "../cart/cart.repository.js";
import { orderRepository } from "./order.repository.js";

import {
    allowedOrderStatusTransitions,
} from "./order.types.js";

import type { OrderStatus } from "../../generated/prisma/client.js";


export const orderService = {

    async createOrder(userId: string) {
        return prisma.$transaction(async (tx) => {

            const cart =
                await cartRepository.findCartForCheckout(
                    userId,
                    tx,
                );

            if (!cart || cart.items.length === 0) {
                throw new AppError(
                    ERROR_CODES.VALIDATION_ERROR,
                    "Cart is empty",
                    400,
                );
            }

            let subtotalInPaise = 0;

            const items = cart.items.map((cartItem) => {
                const menuItem = cartItem.menuItem;

                if (!menuItem.isActive) {
                    throw new AppError(
                        ERROR_CODES.VALIDATION_ERROR,
                        `Menu item "${menuItem.name}" is no longer available`,
                        400,
                    );
                }

                if (!menuItem.isAvailable) {
                    throw new AppError(
                        ERROR_CODES.VALIDATION_ERROR,
                        `Menu item "${menuItem.name}" is currently unavailable`,
                        400,
                    );
                }

                const itemTotal =
                    menuItem.priceInPaise * cartItem.quantity;

                subtotalInPaise += itemTotal;

                return {
                    menuItemId: menuItem.id,
                    name: menuItem.name,
                    quantity: cartItem.quantity,
                    unitPriceInPaise: menuItem.priceInPaise,
                };
            });

            const order = await orderRepository.createOrder(
                {
                    userId,
                    subtotalInPaise,
                    totalInPaise: subtotalInPaise,
                    items,
                },
                tx,
            );

            await cartRepository.clearCart(
                cart.id,
                tx,
            );

            return order;
        });
    },


    async getOrders(userId: string) {
        return orderRepository.findOrdersByUserId(userId);
    },


    async getOrderById(
        userId: string,
        orderId: string,
    ) {
        const order =
            await orderRepository.findOrderById(orderId);

        if (!order) {
            throw new AppError(
                ERROR_CODES.ORDER_NOT_FOUND,
                "Order not found",
                404,
            );
        }

        if (order.userId !== userId) {
            throw new AppError(
                ERROR_CODES.FORBIDDEN,
                "You do not have permission to access this order",
                403,
            );
        }

        return order;
    },

    async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
) {
    const order =
        await orderRepository.findOrderById(orderId);

    if (!order) {
        throw new AppError(
            ERROR_CODES.ORDER_NOT_FOUND,
            "Order not found",
            404,
        );
    }

    const allowedStatuses =
        allowedOrderStatusTransitions[order.status];

    if (!allowedStatuses.includes(newStatus)) {
        throw new AppError(
            ERROR_CODES.CONFLICT,
            `Order cannot transition from ${order.status} to ${newStatus}`,
            409,
        );
    }

    const result =
        await orderRepository.updateOrderStatus(
            orderId,
            order.status,
            newStatus,
        );

    if (result.count !== 1) {
        throw new AppError(
            ERROR_CODES.CONFLICT,
            "Order status was changed by another request",
            409,
        );
    }

    const updatedOrder =
        await orderRepository.findOrderById(orderId);

    if (!updatedOrder) {
        throw new AppError(
            ERROR_CODES.ORDER_NOT_FOUND,
            "Order not found",
            404,
        );
    }

    return updatedOrder;
},


async confirmOrderAfterPayment(
    orderId: string,
) {
    const result =
        await orderRepository.updateOrderStatus(
            orderId,
            "PENDING",
            "CONFIRMED",
        );

    if (result.count === 1) {
        return {
            confirmed: true,
        };
    }

    const order =
        await orderRepository.findOrderById(orderId);

    if (!order) {
        throw new AppError(
            ERROR_CODES.ORDER_NOT_FOUND,
            "Order not found",
            404,
        );
    }

    if (order.status === "CONFIRMED") {
        return {
            confirmed: false,
            alreadyConfirmed: true,
        };
    }

    throw new AppError(
        ERROR_CODES.CONFLICT,
        `Order cannot be confirmed because its status is ${order.status}`,
        409,
    );
},
};