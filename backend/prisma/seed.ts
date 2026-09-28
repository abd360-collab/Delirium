import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
    adapter,
});

const categories = [
    {
        name: "THE BREWED ILLUSIONS",
        description: "Custom Tea-Topped Mocktails",
        displayOrder: 1,
    },
    {
        name: "THE CRYSTAL MIRAGES",
        description: "Classic Mocktails & Crushers",
        displayOrder: 2,
    },
    {
        name: "THE LIQUID TRANCE",
        description: "Cold Frappes, Shakes & Smoothies",
        displayOrder: 3,
    },
    {
        name: "THE CAFFEINATED & WARM STATES",
        description: "Tea, Coffee & Comfort Cups",
        displayOrder: 4,
    },
    {
        name: "THE SOLID HALLUCINATIONS",
        description: "Savory Waffles & Waffwiches",
        displayOrder: 5,
    },
    {
        name: "THE HANDHELD DELUSIONS",
        description: "Wraps & Rolls",
        displayOrder: 6,
    },
    {
        name: "THE TOASTED CRAVINGS",
        description: "Sandwiches",
        displayOrder: 7,
    },
    {
        name: "THE CRISPY MIRAGES",
        description: "Snacks, Bowls & Skewers",
        displayOrder: 8,
    },
    {
        name: "THE MACRO STATES",
        description: "Warm Bowls",
        displayOrder: 9,
    },
    {
        name: "THE WAFFLE PARADOX",
        description: "Sweet Waffles & Desserts",
        displayOrder: 10,
    },
    {
        name: "THE FROZEN PARADOX",
        description: "Ice Cream & Sundaes",
        displayOrder: 11,
    },
];

const menuItems = [
    // ============================================================
    // THE BREWED ILLUSIONS
    // ============================================================

    {
        categoryName: "THE BREWED ILLUSIONS",
        name: "The Minty Blueberry Awakening",
        description:
            "Sweet blueberry base topped with cooling Mint Green Tea.",
        priceInPaise: 7900,
    },
    {
        categoryName: "THE BREWED ILLUSIONS",
        name: "The Hibiscus Watermelon Mirage",
        description:
            "Sweet watermelon crowned with tart Hibiscus Cinnamon Clove Green Tea.",
        priceInPaise: 7900,
    },
    {
        categoryName: "THE BREWED ILLUSIONS",
        name: "The Jasmine Apple Illusion",
        description:
            "Crisp green apple balanced by delicate Jasmine Green Tea.",
        priceInPaise: 7900,
    },
    {
        categoryName: "THE BREWED ILLUSIONS",
        name: "The Saffron Orange Trance",
        description:
            "Sweet orange crush topped with rich Kashmiri Kahwa Green Tea.",
        priceInPaise: 7900,
    },

    // ============================================================
    // THE CRYSTAL MIRAGES
    // ============================================================

    {
        categoryName: "THE CRYSTAL MIRAGES",
        name: "The Kaccha Aam Zinger",
        description: "Refreshing raw mango based mocktail.",
        priceInPaise: 4900,
    },
    {
        categoryName: "THE CRYSTAL MIRAGES",
        name: "The Blue Ginger Delusion",
        description: "Refreshing blue mocktail with a ginger twist.",
        priceInPaise: 4900,
    },
    {
        categoryName: "THE CRYSTAL MIRAGES",
        name: "The Watermelon Mint Mojito",
        description: "Refreshing watermelon and mint mojito.",
        priceInPaise: 4900,
    },
    {
        categoryName: "THE CRYSTAL MIRAGES",
        name: "The Blueberry Mint Mojito",
        description: "Blueberry mojito with a refreshing mint finish.",
        priceInPaise: 4900,
    },

    // ============================================================
    // THE LIQUID TRANCE
    // ============================================================

    {
        categoryName: "THE LIQUID TRANCE",
        name: "The KitKat Crunch Trance",
        description: "Rich creamy shake blended with KitKat crunch.",
        priceInPaise: 7900,
    },
    {
        categoryName: "THE LIQUID TRANCE",
        name: "The Paradox Shake",
        description:
            "Creamy shake available in multiple delicious flavors.",
        priceInPaise: 6900,
    },
    {
        categoryName: "THE LIQUID TRANCE",
        name: "Protein Smoothie Bowl",
        description: "Nutritious and filling protein smoothie bowl.",
        priceInPaise: 7900,
    },
    {
        categoryName: "THE LIQUID TRANCE",
        name: "The Vanilla Illusion",
        description: "Smooth and creamy classic vanilla shake.",
        priceInPaise: 6900,
    },

    // ============================================================
    // THE CAFFEINATED & WARM STATES
    // ============================================================

    {
        categoryName: "THE CAFFEINATED & WARM STATES",
        name: "Teabox Wellness Green Tea",
        description: "Choose from 10 signature green tea flavors.",
        priceInPaise: 2900,
    },
    {
        categoryName: "THE CAFFEINATED & WARM STATES",
        name: "The Golden Delirium Latte",
        description: "Rich and creamy signature golden latte.",
        priceInPaise: 5900,
    },
    {
        categoryName: "THE CAFFEINATED & WARM STATES",
        name: "The Boosted Awakening",
        description: "Pure, simple hot espresso shot.",
        priceInPaise: 1900,
    },
    {
        categoryName: "THE CAFFEINATED & WARM STATES",
        name: "The Delusion Hot Chocolate",
        description: "Warm and creamy indulgent hot chocolate.",
        priceInPaise: 4900,
    },

    // ============================================================
    // THE SOLID HALLUCINATIONS
    // ============================================================

    {
        categoryName: "THE SOLID HALLUCINATIONS",
        name: "Crispy Chicken Waffwich",
        description: "Crispy chicken served inside a savory waffle.",
        priceInPaise: 9900,
    },
    {
        categoryName: "THE SOLID HALLUCINATIONS",
        name: "Crispy Paneer Waffwich",
        description: "Crispy paneer served inside a savory waffle.",
        priceInPaise: 9900,
    },
    {
        categoryName: "THE SOLID HALLUCINATIONS",
        name: "Melted Pizza Waffle (Veg)",
        description: "Cheesy vegetable pizza toppings on a crispy waffle.",
        priceInPaise: 9900,
    },
    {
        categoryName: "THE SOLID HALLUCINATIONS",
        name: "Melted Pizza Waffle (Chicken Sausage)",
        description: "Cheesy pizza waffle topped with chicken sausage.",
        priceInPaise: 10900,
    },

    // ============================================================
    // THE HANDHELD DELUSIONS
    // ============================================================

    {
        categoryName: "THE HANDHELD DELUSIONS",
        name: "Creamy Chicken Wrap",
        description: "Creamy chicken filling wrapped in a soft tortilla.",
        priceInPaise: 7900,
    },
    {
        categoryName: "THE HANDHELD DELUSIONS",
        name: "Creamy Tikka Chicken Wrap",
        description: "Creamy chicken tikka wrapped with fresh ingredients.",
        priceInPaise: 6900,
    },
    {
        categoryName: "THE HANDHELD DELUSIONS",
        name: "Creamy Paneer Wrap",
        description: "Creamy paneer filling wrapped in a soft tortilla.",
        priceInPaise: 6900,
    },
    {
        categoryName: "THE HANDHELD DELUSIONS",
        name: "Crunchy Chicken Wrap",
        description: "Crunchy chicken with fresh fillings in a soft wrap.",
        priceInPaise: 6900,
    },

    // ============================================================
    // THE TOASTED CRAVINGS
    // ============================================================

    {
        categoryName: "THE TOASTED CRAVINGS",
        name: "Pepper-Mayo Chicken Sandwich",
        description: "Chicken sandwich with creamy pepper mayo.",
        priceInPaise: 6900,
    },
    {
        categoryName: "THE TOASTED CRAVINGS",
        name: "Creamy Tikka Chicken Sandwich",
        description: "Creamy chicken tikka layered between toasted bread.",
        priceInPaise: 6900,
    },
    {
        categoryName: "THE TOASTED CRAVINGS",
        name: "Cheesy Creamy Chicken Sandwich",
        description: "Creamy chicken sandwich loaded with cheese.",
        priceInPaise: 7900,
    },
    {
        categoryName: "THE TOASTED CRAVINGS",
        name: "The Fresh Veggie Awakening",
        description: "Fresh vegetables and creamy filling in toasted bread.",
        priceInPaise: 4900,
    },

    // ============================================================
    // THE CRISPY MIRAGES
    // ============================================================

    {
        categoryName: "THE CRISPY MIRAGES",
        name: "DELIRIUM'S SIGNATURE FRIES",
        description: "Crispy golden fries with your choice of seasoning.",
        priceInPaise: 4900,
    },
    {
        categoryName: "THE CRISPY MIRAGES",
        name: "Loaded Nachos (Veg)",
        description: "Crispy nachos loaded with cheesy vegetable toppings.",
        priceInPaise: 6900,
    },
    {
        categoryName: "THE CRISPY MIRAGES",
        name: "Chicken Popcorn",
        description: "Bite-sized crispy chicken pieces.",
        priceInPaise: 9900,
    },
    {
        categoryName: "THE CRISPY MIRAGES",
        name: "Paneer Tikka Skewers",
        description: "Char-grilled paneer tikka served on skewers.",
        priceInPaise: 3900,
    },

    // ============================================================
    // THE MACRO STATES
    // ============================================================

    {
        categoryName: "THE MACRO STATES",
        name: "Classic Masala Maggi",
        description: "Classic masala Maggi noodles.",
        priceInPaise: 3900,
    },
    {
        categoryName: "THE MACRO STATES",
        name: "White Sauce Maggi",
        description: "Creamy white sauce Maggi noodles.",
        priceInPaise: 5900,
    },
    {
        categoryName: "THE MACRO STATES",
        name: "Red Sauce Maggi",
        description: "Tangy red sauce Maggi noodles.",
        priceInPaise: 4900,
    },
    {
        categoryName: "THE MACRO STATES",
        name: "Korean Spiced Maggi",
        description: "Spicy Korean-style Maggi noodles.",
        priceInPaise: 4900,
    },

    // ============================================================
    // THE WAFFLE PARADOX
    // ============================================================

    {
        categoryName: "THE WAFFLE PARADOX",
        name: "The Kunafa Delirium",
        description: "Sweet waffle inspired by rich kunafa flavors.",
        priceInPaise: 11900,
    },
    {
        categoryName: "THE WAFFLE PARADOX",
        name: "The Indigo Awakening",
        description: "Sweet and indulgent signature dessert waffle.",
        priceInPaise: 6900,
    },
    {
        categoryName: "THE WAFFLE PARADOX",
        name: "The Dual Mirage",
        description: "A delicious combination of two sweet flavors.",
        priceInPaise: 7900,
    },
    {
        categoryName: "THE WAFFLE PARADOX",
        name: "The Peanut Butter Paradox",
        description: "Rich peanut butter dessert waffle.",
        priceInPaise: 5900,
    },

    // ============================================================
    // THE FROZEN PARADOX
    // ============================================================

    {
        categoryName: "THE FROZEN PARADOX",
        name: "Brownie Sundae",
        description:
            "Ice cream layered with warm brownie chunks and fudge.",
        priceInPaise: 7500,
    },
    {
        categoryName: "THE FROZEN PARADOX",
        name: "The Frozen Delusions",
        description: "Ice cream served in a crisp waffle bowl.",
        priceInPaise: 3500,
    },
    {
        categoryName: "THE FROZEN PARADOX",
        name: "Chocolate Ice Cream",
        description: "Rich and creamy chocolate ice cream.",
        priceInPaise: 3500,
    },
    {
        categoryName: "THE FROZEN PARADOX",
        name: "Butterscotch Ice Cream",
        description: "Creamy butterscotch ice cream with a sweet finish.",
        priceInPaise: 3500,
    },
];


const localImageUrls: Record<string, string> = {
    "The Kunafa Delirium": "/images/menu/kunafa-delirium.jpg",
    "Crispy Paneer Waffwich": "/images/menu/crispy-paneer-waffwich.jpg",
    "The Kaccha Aam Zinger": "/images/menu/kaccha-aam-zinger.jpg",
    "Brownie Sundae": "/images/menu/brownie-sundae.jpg",
};

async function main() {
    console.log("🌱 Starting Delirium database seed...");

    /*
     * Development database only.
     *
     * Remove existing menu data so that running the seed repeatedly
     * does not create duplicate categories/menu items.
     */
    await prisma.menuItem.deleteMany();
    await prisma.category.deleteMany();

    const categoryMap = new Map<string, string>();

    for (const categoryData of categories) {
        const category = await prisma.category.create({
            data: {
                name: categoryData.name,
                description: categoryData.description,
                displayOrder: categoryData.displayOrder,
                isActive: true,
            },
        });

        categoryMap.set(category.name, category.id);

        console.log(`Created category: ${category.name}`);
    }

    for (const [index, menuItem] of menuItems.entries()) {
        const categoryId = categoryMap.get(menuItem.categoryName);

        if (!categoryId) {
            throw new Error(
                `Category not found: ${menuItem.categoryName}`,
            );
        }

        await prisma.menuItem.create({
            data: {
                categoryId,
                name: menuItem.name,
                description: menuItem.description,
            imageUrl:
    localImageUrls[menuItem.name] ??
    `https://picsum.photos/seed/delirium-${index + 1}/600/400`,
                priceInPaise: menuItem.priceInPaise,
                isActive: true,
                isAvailable: true,
            },
        });

        console.log(`  Created menu item: ${menuItem.name}`);
    }

    console.log("");
    console.log("✅ Delirium seed completed successfully.");
    console.log(`📂 Categories: ${categories.length}`);
    console.log(`🍽️ Menu items: ${menuItems.length}`);
}

main()
    .catch((error) => {
        console.error("❌ Seed failed:", error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });