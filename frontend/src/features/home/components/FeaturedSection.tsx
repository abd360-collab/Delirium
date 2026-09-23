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
        >
            <div className="featured-section__content">
                <p className="featured-section__eyebrow">
                    ENTER THE DELIRIUM
                </p>

                <h2>
                    {menuItem?.name ?? "THE WAFFLE PARADOX"}
                </h2>

                {menuItem?.description && (
                    <p>
                        {menuItem.description}
                    </p>
                )}

                <a href="/menu">
                    Discover the Menu
                </a>
            </div>

            <div className="featured-section__visual">
                {menuItem?.imageUrl ? (
                    <img
                        src={menuItem.imageUrl}
                        alt={menuItem.name}
                        className="featured-section__image"
                    />
                ) : (
                    <div className="featured-section__shape">
                        <span>WAFFLES</span>
                        <strong>∞</strong>
                    </div>
                )}
            </div>
        </section>
    );
}