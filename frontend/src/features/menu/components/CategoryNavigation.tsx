import type { Category } from "../../../types/menu.types";

interface CategoryNavigationProps {
    categories: Category[];
    selectedCategoryId: string | null;
    onCategorySelect: (categoryId: string | null) => void;
}

export function CategoryNavigation({
    categories,
    selectedCategoryId,
    onCategorySelect,
}: CategoryNavigationProps) {
    const activeCategories = categories.filter(
        (category) => category.isActive,
    );

    return (
        <nav
            className="category-navigation"
            aria-label="Menu categories"
        >
            <button
                type="button"
                className={
                    selectedCategoryId === null
                        ? "category-navigation__item category-navigation__item--active"
                        : "category-navigation__item"
                }
                onClick={() => {
                    onCategorySelect(null);
                }}
                aria-pressed={selectedCategoryId === null}
            >
                All
            </button>

            {activeCategories.map((category) => (
                <button
                    key={category.id}
                    type="button"
                    className={
                        selectedCategoryId === category.id
                            ? "category-navigation__item category-navigation__item--active"
                            : "category-navigation__item"
                    }
                    onClick={() => {
                        onCategorySelect(category.id);
                    }}
                    aria-pressed={
                        selectedCategoryId === category.id
                    }
                >
                    {category.name}
                </button>
            ))}
        </nav>
    );
}