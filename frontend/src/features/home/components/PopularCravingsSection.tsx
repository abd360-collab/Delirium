
import { Link } from "react-router-dom";

import type { MenuItem } from "../../../types/menu.types";


interface PopularCravingsSectionProps {
    menuItems: MenuItem[];
}

const POPULAR_ITEM_NAMES = [
    "The Kunafa Delirium",
    "Crispy Paneer Waffwich",
    "The Kaccha Aam Zinger",
    "Brownie Sundae",
];

const formatPrice = (priceInPaise: number): string =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
        minimumFractionDigits: 0,
    }).format(priceInPaise / 100);

export function PopularCravingsSection({
    menuItems,
}: PopularCravingsSectionProps) {
    const popularItems = POPULAR_ITEM_NAMES
        .map((name) =>
            menuItems.find(
                (menuItem) =>
                    menuItem.name === name &&
                    menuItem.isActive &&
                    menuItem.isAvailable,
            ),
        )
        .filter(
            (menuItem): menuItem is MenuItem =>
                menuItem !== undefined,
        );

    return (
        <section
            className="popular-cravings"
            aria-labelledby="popular-cravings-title"
        >
            <div className="popular-cravings__header">
                <div className="popular-cravings__heading">
                    <p className="popular-cravings__eyebrow">
                        FROM THE DELIRIUM
                    </p>

                    <h2
                        id="popular-cravings-title"
                        className="popular-cravings__title"
                    >
                        POPULAR
                        <br />
                        CRAVINGS.
                    </h2>

                    <p className="popular-cravings__intro">
                        The cravings worth coming back for.
                    </p>
                </div>

                <Link
                    to="/menu"
                    className="popular-cravings__link"
                >
                    View Full Menu
                    <span aria-hidden="true"> ↗</span>
                </Link>
            </div>

            {popularItems.length > 0 ? (
                <div className="popular-cravings__grid">
                    {popularItems.map((menuItem, index) => (
                        <Link
                            key={menuItem.id}
                            to={`/menu?item=${encodeURIComponent(
                                menuItem.id,
                            )}`}
                            className="popular-cravings__item"
                            aria-label={`View ${menuItem.name}, ${formatPrice(
                                menuItem.priceInPaise,
                            )}`}
                        >
                            <div className="popular-cravings__image-wrapper">
                                <div
                                    className="popular-cravings__image-placeholder"
                                    aria-hidden="true"
                                >
                                    <span>DELIRIUM</span>
                                    <strong>
                                        {String(index + 1).padStart(2, "0")}
                                    </strong>
                                </div>

                                {menuItem.imageUrl && (
                                    <img
                                        src={menuItem.imageUrl}
                                        alt={menuItem.name}
                                        className="popular-cravings__image"
                                        loading="lazy"
                                        decoding="async"
                                        onError={(event) => {
                                            event.currentTarget.style.display =
                                                "none";
                                        }}
                                    />
                                )}

                                <span
                                    className="popular-cravings__image-arrow"
                                    aria-hidden="true"
                                >
                                    ↗
                                </span>
                            </div>

                            <div className="popular-cravings__item-info">
                                <h3>{menuItem.name}</h3>

                                <span className="popular-cravings__price">
                                    {formatPrice(menuItem.priceInPaise)}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="popular-cravings__empty">
                    <span
                        className="popular-cravings__empty-mark"
                        aria-hidden="true"
                    >
                        *
                    </span>

                    <h3>Something delicious is in the making.</h3>

                    <p>
                        Our featured cravings will be back soon.
                        In the meantime, explore the full menu.
                    </p>

                    <Link
                        to="/menu"
                        className="popular-cravings__empty-link"
                    >
                        Explore the Menu
                        <span aria-hidden="true"> ↗</span>
                    </Link>
                </div>
            )}
        </section>
    );
}
