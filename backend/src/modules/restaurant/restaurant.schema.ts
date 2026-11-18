
import { z } from "zod";

export const updateRestaurantSchema = z.object({
    name: z.string().trim().min(1).max(150).optional(),

    description: z
        .string()
        .trim()
        .max(1000)
        .nullable()
        .optional(),

    address: z.string().trim().min(5).max(500).optional(),

    phoneNumber: z
        .string()
        .trim()
        .min(10)
        .max(15)
        .nullable()
        .optional(),

    email: z
        .string()
        .trim()
        .email()
        .nullable()
        .optional(),

    latitude: z.number().min(-90).max(90).optional(),

    longitude: z.number().min(-180).max(180).optional(),

    deliveryRadiusKm: z.number().positive().max(100).optional(),

    imageUrl: z.string().url().nullable().optional(),

    isOpen: z.boolean().optional(),
}).refine(
    (data) => Object.keys(data).length > 0,
    {
        message: "At least one field must be provided",
    },
);

export type UpdateRestaurantInput = z.infer<
    typeof updateRestaurantSchema
>;
