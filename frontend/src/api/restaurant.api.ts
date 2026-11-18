
import { apiClient } from "../lib/api/client";
import type {
    Restaurant,
    UpdateRestaurantInput,
} from "../types/restaurant.types";

interface GetRestaurantResponse {
    success: boolean;
    data: {
        restaurant: Restaurant;
    };
}

interface UpdateRestaurantResponse {
    success: boolean;
    data: {
        restaurant: Restaurant;
    };
}

export async function getRestaurant(): Promise<Restaurant> {
    const response =
        await apiClient.get<GetRestaurantResponse>(
            "/restaurant/",
        );

    return response.data.data.restaurant;
}

export async function updateRestaurant(
    input: UpdateRestaurantInput,
): Promise<Restaurant> {
    const response =
        await apiClient.patch<UpdateRestaurantResponse>(
            "/restaurant/",
            input,
        );

    return response.data.data.restaurant;
}
