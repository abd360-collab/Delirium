import { prisma } from "../../lib/prisma.js";

import type {
    CreateOrderData,
} from "./order.types.js";


export const orderRepository = {

    createOrder(data: CreateOrderData) {
        return prisma.order.create({
            data: {
                userId: data.userId,
                subtotalInPaise: data.subtotalInPaise,
                totalInPaise: data.totalInPaise,

                items: {
                    create: data.items.map((item) => ({
                        menuItemId: item.menuItemId,
                        name: item.name,
                        quantity: item.quantity,
                        unitPriceInPaise: item.unitPriceInPaise,
                    })),
                },
            },

            include: {
                items: true,
            },
        });
    },


    findOrderById(orderId: string) {
        return prisma.order.findUnique({
            where: {
                id: orderId,
            },

            include: {
                items: true,
            },
        });
    },


    findOrdersByUserId(userId: string) {
        return prisma.order.findMany({
            where: {
                userId,
            },

            include: {
                items: true,
            },

            orderBy: {
                createdAt: "desc",
            },
        });
    },

    
};