
export interface Restaurant {
    id: string;
    name: string;
    description: string | null;
    address: string;
    phoneNumber: string | null;
    email: string | null;
    latitude: number;
    longitude: number;
    deliveryRadiusKm: number;
    imageUrl: string | null;
    isOpen: boolean;
    createdAt: string;
    updatedAt: string;
}

export type UpdateRestaurantInput = Partial<
    Omit<Restaurant, "id" | "createdAt" | "updatedAt">
>;
