
import { prisma } from "../../infrastructure/database/prisma.js";

const RESTAURANT_ID = "default";

export interface UpdateRestaurantData {
    name?: string | undefined;
    description?: string | null | undefined;
    address?: string | undefined;
    phoneNumber?: string | null | undefined;
    email?: string | null | undefined;
    latitude?: number | undefined;
    longitude?: number | undefined;
    deliveryRadiusKm?: number | undefined;
    imageUrl?: string | null | undefined;
    isOpen?: boolean | undefined;
}

export const restaurantRepository = {
    findRestaurant() {
        return prisma.restaurant.findUnique({
            where: {
                id: RESTAURANT_ID,
            },
        });
    },

    initializeRestaurant() {
        return prisma.restaurant.upsert({
            where: {
                id: RESTAURANT_ID,
            },
            update: {},
            create: {
                id: RESTAURANT_ID,
                name: "DELIRIUM",
                address:
                    "215, Prince Anwar Shah Rd, Jodhpur Gardens, Jodhpur Park, Kolkata, West Bengal 700045",
                latitude: 22.503053546678277,
                longitude: 88.36097805582347,
                deliveryRadiusKm: 5,
                isOpen: true,
                phoneNumber: null,
                email: null,
                description: null,
                imageUrl: null,
            },
        });
    },

    updateRestaurant(
        restaurantId: string,
        data: UpdateRestaurantData,
    ) {
        return prisma.restaurant.update({
            where: {
                id: restaurantId,
            },
            data: {
                ...(data.name !== undefined && {
                    name: data.name,
                }),

                ...(data.description !== undefined && {
                    description: data.description,
                }),

                ...(data.address !== undefined && {
                    address: data.address,
                }),

                ...(data.phoneNumber !== undefined && {
                    phoneNumber: data.phoneNumber,
                }),

                ...(data.email !== undefined && {
                    email: data.email,
                }),

                ...(data.latitude !== undefined && {
                    latitude: data.latitude,
                }),

                ...(data.longitude !== undefined && {
                    longitude: data.longitude,
                }),

                ...(data.deliveryRadiusKm !== undefined && {
                    deliveryRadiusKm: data.deliveryRadiusKm,
                }),

                ...(data.imageUrl !== undefined && {
                    imageUrl: data.imageUrl,
                }),

                ...(data.isOpen !== undefined && {
                    isOpen: data.isOpen,
                }),
            },
        });
    },
};
