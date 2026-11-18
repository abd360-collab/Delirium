
import type { Request, Response } from "express";

import { updateRestaurantSchema } from "./restaurant.schema.js";
import { restaurantService } from "./restaurant.service.js";

export async function getRestaurant(
    _req: Request,
    res: Response,
) {
    const restaurant = await restaurantService.getRestaurant();

    return res.status(200).json({
        success: true,
        data: {
            restaurant,
        },
    });
}

export async function updateRestaurant(
    req: Request,
    res: Response,
) {
    const input = updateRestaurantSchema.parse(req.body);

    const restaurant =
        await restaurantService.updateRestaurant(input);

    return res.status(200).json({
        success: true,
        data: {
            restaurant,
        },
    });
}
