import { useEffect, useState } from "react";

import { getMenuItems } from "../../../api/menu.api";

import type { MenuItem } from "../../../types/menu.types";

import { HeroSection } from "../components/HeroSection";
import { FeaturedSection } from "../components/FeaturedSection";

export function HomePage() {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        async function loadFeaturedItems() {
            try {
                const items = await getMenuItems();

                if (!isMounted) {
                    return;
                }

                setMenuItems(items);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        void loadFeaturedItems();

        return () => {
            isMounted = false;
        };
    }, []);

    const featuredItem =
        menuItems.find(
            (menuItem) =>
                menuItem.isActive &&
                menuItem.isAvailable &&
                menuItem.imageUrl,
        ) ?? null;

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <HeroSection />

            <FeaturedSection
                menuItem={featuredItem}
            />

            {/* More homepage sections will come here */}
        </div>
    );
}