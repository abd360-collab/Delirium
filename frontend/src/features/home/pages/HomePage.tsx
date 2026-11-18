
import { useEffect, useState } from "react";

import {
    getCategories,
    getMenuItems,
} from "../../../api/menu.api";

import type {
    Category,
    MenuItem,
} from "../../../types/menu.types";

import { HeroSection } from "../components/HeroSection";
import { FeaturedSection } from "../components/FeaturedSection";
import { AboutSection } from "../components/AboutSection";
import { CategoryShowcase } from "../../menu/components/CategoryShowcase";
import { PopularCravingsSection } from "../components/PopularCravingsSection";
import { FinalCtaSection } from "../components/FinalCtaSection";



export function HomePage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        let isMounted = true;

        async function loadHomepageContent() {
            setIsLoading(true);
            setError(null);

            try {
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

                setError(
                    "We couldn't load the menu right now. Please try again.",
                );
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        void loadHomepageContent();

        return () => {
            isMounted = false;
        };
    }, [retryCount]);

    const featuredCategory = categories.find(
        (category) =>
            category.name.trim().toUpperCase() ===
                "THE WAFFLE PARADOX" &&
            category.isActive,
    );

    const featuredItem =
        menuItems.find(
            (menuItem) =>
                menuItem.categoryId === featuredCategory?.id &&
                menuItem.isActive &&
                menuItem.isAvailable &&
                Boolean(menuItem.imageUrl?.trim()),
        ) ?? null;

    if (isLoading) {
        return (
            <section
                className="home-state home-state--loading"
                aria-label="Homepage loading"
                aria-busy="true"
            >
                <div className="home-state__skeleton-hero" aria-hidden="true">
                    <div className="home-state__skeleton-copy">
                        <span className="home-state__skeleton-line home-state__skeleton-line--short" />
                        <span className="home-state__skeleton-line home-state__skeleton-line--heading" />
                        <span className="home-state__skeleton-line home-state__skeleton-line--heading home-state__skeleton-line--partial" />
                        <span className="home-state__skeleton-line home-state__skeleton-line--body" />
                        <span className="home-state__skeleton-button" />
                    </div>

                    <div className="home-state__skeleton-image" />
                </div>

                <p className="home-state__loading-label" role="status">
                    Preparing something delicious...
                </p>
            </section>
        );
    }

    if (error) {
        return (
            <section
                className="home-state home-state--error"
                aria-labelledby="home-state-error-title"
            >
                <div
                    className="home-state__error-icon"
                    aria-hidden="true"
                >
                    !
                </div>

                <p className="home-state__eyebrow">
                    A LITTLE KITCHEN PAUSE
                </p>

                <h1
                    id="home-state-error-title"
                    className="home-state__title"
                >
                    Something went
                    <br />
                    off the menu.
                </h1>

                <p className="home-state__message" role="alert">
                    {error}
                </p>

                <button
                    type="button"
                    className="home-state__retry"
                    onClick={() => setRetryCount((count) => count + 1)}
                >
                    Try again
                </button>
            </section>
        );
    }

    return (
        <div className="home-page">
            <HeroSection />

            <FeaturedSection menuItem={featuredItem} />

            <AboutSection />

            <CategoryShowcase categories={categories} />

            <PopularCravingsSection menuItems={menuItems} />

            <FinalCtaSection />
        </div>
    );
}
