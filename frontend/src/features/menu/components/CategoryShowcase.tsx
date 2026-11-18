
import { Link } from "react-router-dom";

import type { Category } from "../../../types/menu.types";


interface CategoryShowcaseProps {
    categories: Category[];
}

export function CategoryShowcase({
    categories,
}: CategoryShowcaseProps) {
    const activeCategories = categories
        .filter((category) => category.isActive)
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .slice(0, 6);

    return (
        <section
            className="category-showcase"
            aria-labelledby="category-showcase-title"
        >
            <div className="category-showcase__header">
                <p className="category-showcase__eyebrow">
                    EXPLORE THE STATES
                </p>

                <h2
                    id="category-showcase-title"
                    className="category-showcase__title"
                >
                    FIND YOUR
                    <br />
                    DELIRIUM.
                </h2>

                <p className="category-showcase__intro">
                    Sweet, crispy, frozen, fizzy.
                    Pick a direction and see where it takes you.
                </p>
            </div>

            <div className="category-showcase__content">
                {activeCategories.length > 0 ? (
                    <div className="category-showcase__grid">
                        {activeCategories.map((category, index) => (
                            <Link
                                key={category.id}
                                to={`/menu?category=${encodeURIComponent(
                                    category.id,
                                )}`}
                                className="category-showcase__card"
                                aria-label={`Explore ${category.name}${
                                    category.description
                                        ? `: ${category.description}`
                                        : ""
                                }`}
                            >
                                <span
                                    className="category-showcase__number"
                                    aria-hidden="true"
                                >
                                    {String(index + 1).padStart(2, "0")}
                                </span>

                                <h3 className="category-showcase__name">
                                    {category.name}
                                </h3>

                                {category.description && (
                                    <p className="category-showcase__description">
                                        {category.description}
                                    </p>
                                )}

                                <span
                                    className="category-showcase__arrow"
                                    aria-hidden="true"
                                >
                                    ↗
                                </span>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="category-showcase__empty">
                        <span
                            className="category-showcase__empty-mark"
                            aria-hidden="true"
                        >
                            *
                        </span>

                        <h3>The menu is taking a little break.</h3>

                        <p>
                            Our categories will be back soon.
                            Please check the menu again shortly.
                        </p>

                        <Link
                            to="/menu"
                            className="category-showcase__empty-link"
                        >
                            Explore the menu
                            <span aria-hidden="true"> ↗</span>
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
}
