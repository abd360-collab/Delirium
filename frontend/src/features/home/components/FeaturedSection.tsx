import { Link } from "react-router-dom";
import type { MenuItem } from "../../../types/menu.types";

interface FeaturedSectionProps {
    menuItem: MenuItem | null;
}

export function FeaturedSection({
    menuItem,
}: FeaturedSectionProps) {
    return (
        <section
            id="featured"
            className="featured-section"
            aria-labelledby="featured-section-title"
        >
            <div className="featured-section__content">
                <p className="featured-section__eyebrow">
                    ENTER THE DELIRIUM
                </p>

                <h2
                    id="featured-section-title"
                    className="featured-section__title"
                >
                    {menuItem?.name ?? "THE WAFFLE PARADOX"}
                </h2>

                {menuItem?.description && (
                    <p className="featured-section__description">
                        {menuItem.description}
                    </p>
                )}

                <Link
                    to="/menu"
                    className="featured-section__cta"
                >
                    Discover the Menu
                    <span
                        className="featured-section__cta-arrow"
                        aria-hidden="true"
                    >
                        ↗
                    </span>
                </Link>
            </div>

            <div className="featured-section__visual">
                {menuItem?.imageUrl ? (
                    <img
                        src={menuItem.imageUrl}
                        alt={menuItem.name}
                        className="featured-section__image"
                        loading="lazy"
                        decoding="async"
                    />
                ) : (
                    <div
                        className="featured-section__shape"
                        aria-hidden="true"
                    >
                        <span>WAFFLES</span>
                        <strong>∞</strong>
                    </div>
                )}

                <div
                    className="featured-section__visual-badge"
                    aria-hidden="true"
                >
                    <span>MADE FOR</span>
                    <strong>CRAVINGS</strong>
                </div>
            </div>
        </section>
    );
}
