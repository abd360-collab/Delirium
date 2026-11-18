export interface Category {
    id: string;
    name: string;
    description: string | null;
    displayOrder: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface MenuItem {
    id: string;
    categoryId: string;
    name: string;
    description: string | null;
    priceInPaise: number;
    imageUrl: string | null;
    isActive: boolean;
    isAvailable: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCategoryInput {
    name: string;
    description?: string;
    displayOrder: number;
}

export interface UpdateCategoryInput {
    name?: string;
    description?: string;
    displayOrder?: number;
    isActive?: boolean;
}

export interface CreateMenuItemInput {
    categoryId: string;
    name: string;
    description?: string;
    priceInPaise: number;
    imageUrl?: string;
}

export interface UpdateMenuItemInput {
    categoryId?: string;
    name?: string;
    description?: string;
    priceInPaise?: number;
    imageUrl?: string;
    isActive?: boolean;
    isAvailable?: boolean;
}