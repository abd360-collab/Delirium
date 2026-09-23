import { useEffect, useMemo, useState } from "react";

import {
    getCategories,
    getMenuItems,
} from "../../../api/menu.api";

import type {
    Category,
    MenuItem,
} from "../../../types/menu.types";

import { CategoryNavigation } from "../components/CategoryNavigation";
import { MenuItemList } from "../components/MenuItemList";

import { useCartContext } from "../../../context/CartContext";


export function MenuPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] =
        useState<string | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { addItem } = useCartContext();

    useEffect(() => {
        let isMounted = true;

        async function loadMenu() {
            try {
                setIsLoading(true);
                setError(null);

                const [loadedCategories, loadedMenuItems] =
                    await Promise.all([
                        getCategories(),
                        getMenuItems(),
                    ]);

                if (!isMounted) {
                    return;
                }

                setCategories(loadedCategories);
                setMenuItems(loadedMenuItems);
            } catch {
                if (!isMounted) {
                    return;
                }

                setError("Failed to load menu");
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        void loadMenu();

        return () => {
            isMounted = false;
        };
    }, []);

    const filteredMenuItems = useMemo(() => {
        if (selectedCategoryId === null) {
            return menuItems;
        }

        return menuItems.filter(
            (menuItem) =>
                menuItem.categoryId === selectedCategoryId,
        );
    }, [menuItems, selectedCategoryId]);

    if (isLoading) {
        return <div>Loading menu...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

   

    return (
        <div>

            <section
                id="menu"
                className="menu-section"
            >
                <div className="menu-section__header">
                    <p className="menu-section__eyebrow">
                        EXPLORE THE DELIRIUM
                    </p>

                    <h2>THE MENU</h2>

                    <p>
                        Pick your craving. Enter your state of
                        delicious confusion.
                    </p>
                </div>

                <CategoryNavigation
                    categories={categories}
                    selectedCategoryId={selectedCategoryId}
                    onCategorySelect={setSelectedCategoryId}
                />

                <MenuItemList
                    menuItems={filteredMenuItems}
                    onAdd={addItem}
                />
            </section>
        </div>
    );
}