import type { MenuItem } from "../../../types/menu.types";
import { MenuItemCard } from "./MenuItemCard";

interface MenuItemListProps {
    menuItems: MenuItem[];
    onAdd: (menuItem: MenuItem) => void;
}

export function MenuItemList({
    menuItems,
    onAdd,
}: MenuItemListProps) {
    if (menuItems.length === 0) {
        return <p>No items available in this category.</p>;
    }

    return (
        <div className="menu-item-list">
            {menuItems.map((menuItem) => (
                <MenuItemCard
                    key={menuItem.id}
                    menuItem={menuItem}
                    onAdd={onAdd}
                />
            ))}
        </div>
    );
}