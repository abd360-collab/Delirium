import { prisma } from "../../lib/prisma.js";

import type {
    CreateCartItemData,
} from "./cart.types.js";

export const cartRepository = {
    findCartByUserId(userId: string) {
        return prisma.cart.findUnique({
            where: {
                userId,
            },
        });
    },

    createCart(userId: string) {
        return prisma.cart.create({
            data: {
                userId,
            },
        });
    },

    findCartById(cartId: string) {
        return prisma.cart.findUnique({
            where: {
                id: cartId,
            },
        });
    },

    findCartItem(
        cartId: string,
        menuItemId: string,
    ) {
        return prisma.cartItem.findUnique({
            where: {
                cartId_menuItemId: {
                    cartId,
                    menuItemId,
                },
            },
        });
    },

    findCartItemById(cartItemId: string) {
    return prisma.cartItem.findUnique({
        where: {
            id: cartItemId,
        },
    });
},

    createCartItem(data: CreateCartItemData) {
        return prisma.cartItem.create({
            data,
        });
    },

    updateCartItemQuantity(
        cartItemId: string,
        quantity: number,
    ) {
        return prisma.cartItem.update({
            where: {
                id: cartItemId,
            },
            data: {
                quantity,
            },
        });
    },

    deleteCartItem(cartItemId: string) {
        return prisma.cartItem.delete({
            where: {
                id: cartItemId,
            },
        });
    },

    clearCart(cartId: string) {
        return prisma.cartItem.deleteMany({
            where: {
                cartId,
            },
        });
    },

    findCartWithItems(cartId: string) {
        return prisma.cart.findUnique({
            where: {
                id: cartId,
            },
            include: {
                items: {
                    include: {
                        menuItem: {
                            include: {
                                category: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: "asc",
                    },
                },
            },
        });
    },

    findCartForCheckout(userId: string) {
    return prisma.cart.findUnique({
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
},
};