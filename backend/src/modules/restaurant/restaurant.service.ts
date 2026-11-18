
import { AppError } from "../../shared/errors/AppError.js";
import { ERROR_CODES } from "../../shared/errors/errorCodes.js";
import { restaurantRepository } from "./restaurant.repository.js";
import type { UpdateRestaurantInput } from "./restaurant.schema.js";

export const restaurantService = {
    async initializeRestaurant() {
        return restaurantRepository.initializeRestaurant();
    },

    async getRestaurant() {
        const restaurant =
            await restaurantRepository.findRestaurant();

        if (!restaurant) {
            throw new AppError(
                ERROR_CODES.RESTAURANT_NOT_FOUND,
                "Restaurant configuration not found",
                404,
            );
        }

        return restaurant;
    },

    async updateRestaurant(input: UpdateRestaurantInput) {
        const restaurant = await this.getRestaurant();

        return restaurantRepository.updateRestaurant(
            restaurant.id,
            input,
        );
    },
};
