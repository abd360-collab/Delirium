import type { Request, Response } from "express";

import {
    createCategorySchema,
    updateCategorySchema,
    createMenuItemSchema,
    updateMenuItemSchema,
} from "./menu.schema.js";

import { menuService } from "./menu.service.js";
import { getRequiredParam } from "../../lib/requestParams.js";


export async function createCategory(
    req: Request,
    res: Response,
) {
    const input = createCategorySchema.parse(req.body);

    const category = await menuService.createCategory(input);

    return res.status(201).json({
        success: true,
        data: {
            category,
        },
    });
}


export async function getCategory(
    req: Request,
    res: Response,
) {
    const categoryId = getRequiredParam(
        req.params.id,
        "id",
    );

    const category = await menuService.getCategoryById(
        categoryId,
    );

    return res.status(200).json({
        success: true,
        data: {
            category,
        },
    });
}


export async function listCategories(
    _req: Request,
    res: Response,
) {
    const categories = await menuService.listCategories();

    return res.status(200).json({
        success: true,
        data: {
            categories,
        },
    });
}


export async function updateCategory(
    req: Request,
    res: Response,
) {
    const input = updateCategorySchema.parse(req.body);

    const categoryId = getRequiredParam(
        req.params.id,
        "id",
    );

    const category = await menuService.updateCategory(
        categoryId,
        input,
    );

    return res.status(200).json({
        success: true,
        data: {
            category,
        },
    });
}


export async function deleteCategory(
    req: Request,
    res: Response,
) {
    const categoryId = getRequiredParam(
        req.params.id,
        "id",
    );

    await menuService.deleteCategory(categoryId);

    return res.status(204).send();
}


export async function createMenuItem(
    req: Request,
    res: Response,
) {
    const input = createMenuItemSchema.parse(req.body);

    const menuItem = await menuService.createMenuItem(input);

    return res.status(201).json({
        success: true,
        data: {
            menuItem,
        },
    });
}


export async function getMenuItem(
    req: Request,
    res: Response,
) {
    const menuItem = await menuService.getMenuItemById(
        getRequiredParam(req.params.id, "id"),
    );

    return res.status(200).json({
        success: true,
        data: {
            menuItem,
        },
    });
}


export async function listMenuItems(
    _req: Request,
    res: Response,
) {
    const menuItems = await menuService.listMenuItems();

    return res.status(200).json({
        success: true,
        data: {
            menuItems,
        },
    });
}


export async function updateMenuItem(
    req: Request,
    res: Response,
) {
    const input = updateMenuItemSchema.parse(req.body);

    const menuItem = await menuService.updateMenuItem(
        getRequiredParam(req.params.id, "id"),
        input,
    );

    return res.status(200).json({
        success: true,
        data: {
            menuItem,
        },
    });
}


export async function deleteMenuItem(
    req: Request,
    res: Response,
) {
    await menuService.deleteMenuItem(getRequiredParam(req.params.id, "id"));

    return res.status(204).send();
}