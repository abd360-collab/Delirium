import { prisma } from "../../lib/prisma.js";

import { AppError } from "../../errors/AppError.js";
import { ERROR_CODES } from "../../errors/errorCodes.js";


export const orderService = {

    async createOrder(userId: string) {

        return prisma.$transaction(async (tx) => {

            const cart = await tx.cart.findUnique({
                where: {
                    userId,
                },
                include: {
                    items: {
                        include: {
                            menuItem: true,
                        },
                    },
                },
            });


            if (!cart || cart.items.length === 0) {
                throw new AppError(
                    ERROR_CODES.VALIDATION_ERROR,
                    "Cart is empty",
                    400,
                );
            }


            let subtotalInPaise = 0;


            const orderItems = cart.items.map((cartItem) => {

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


            const totalInPaise = subtotalInPaise;


            const order = await tx.order.create({
                data: {
                    userId,
                    subtotalInPaise,
                    totalInPaise,

                    items: {
                        create: orderItems,
                    },
                },

                include: {
                    items: true,
                },
            });


            await tx.cartItem.deleteMany({
                where: {
                    cartId: cart.id,
                },
            });


            return order;
        });
    },
};