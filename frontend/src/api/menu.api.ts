
import { apiClient } from "../lib/api/client";

import type {
    Category,
    MenuItem,
    CreateCategoryInput,
    UpdateCategoryInput,
    CreateMenuItemInput,
    UpdateMenuItemInput,
} from "../types/menu.types";

interface ListCategoriesResponse {
    success: boolean;
    data: {
        categories: Category[];
    };
}

interface ListMenuItemsResponse {
    success: boolean;
    data: {
        menuItems: MenuItem[];
    };
}

interface CategoryResponse {
    success: boolean;
    data: {
        category: Category;
    };
}

interface MenuItemResponse {
    success: boolean;
    data: {
        menuItem: MenuItem;
    };
}

interface UploadMenuImageResponse {
    success: boolean;
    data: {
        imageUrl: string;
        publicId: string;
    };
}

// Categories

export async function getCategories(): Promise<Category[]> {
    const response =
        await apiClient.get<ListCategoriesResponse>(
            "/menu/categories",
        );

    return response.data.data.categories;
}

export async function createCategory(
    input: CreateCategoryInput,
): Promise<Category> {
    const response =
        await apiClient.post<CategoryResponse>(
            "/menu/categories",
            input,
        );

    return response.data.data.category;
}

export async function updateCategory(
    id: string,
    input: UpdateCategoryInput,
): Promise<Category> {
    const response =
        await apiClient.patch<CategoryResponse>(
            `/menu/categories/${id}`,
            input,
        );

    return response.data.data.category;
}

export async function deleteCategory(id: string): Promise<void> {
    await apiClient.delete(`/menu/categories/${id}`);
}

// Menu Items

export async function getMenuItems(): Promise<MenuItem[]> {
    const response =
        await apiClient.get<ListMenuItemsResponse>(
            "/menu/",
        );

    return response.data.data.menuItems;
}

export async function createMenuItem(
    input: CreateMenuItemInput,
): Promise<MenuItem> {
    const response =
        await apiClient.post<MenuItemResponse>(
            "/menu/",
            input,
        );

    return response.data.data.menuItem;
}

export async function updateMenuItem(
    id: string,
    input: UpdateMenuItemInput,
): Promise<MenuItem> {
    const response =
        await apiClient.patch<MenuItemResponse>(
            `/menu/${id}`,
            input,
        );

    return response.data.data.menuItem;
}

export async function deleteMenuItem(id: string): Promise<void> {
    await apiClient.delete(`/menu/${id}`);
}

// Image Upload

export async function uploadMenuImage(
    image: File,
): Promise<{
    imageUrl: string;
    publicId: string;
}> {
    const formData = new FormData();

    formData.append("image", image);

    const response =
        await apiClient.post<UploadMenuImageResponse>(
            "/menu/upload-image",
            formData,
        );

    return response.data.data;
}
