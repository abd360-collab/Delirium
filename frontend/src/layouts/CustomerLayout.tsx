import { Outlet } from "react-router-dom";

import { CartProvider, useCartContext } from "../context/CartContext";
import { CustomerHeader } from "../features/menu/components/layout/CustomerHeader";
import { CartDrawer } from "../features/cart/components/CartDrawer";
import { useState } from "react";

function CustomerContent() {
    const { cart } = useCartContext();

    const [isCartOpen, setIsCartOpen] = useState(false);

    return (
        <>
            <CustomerHeader
                cartItemCount={cart?.items.length ?? 0}
                onCartClick={() => {
                    setIsCartOpen(true);
                }}
            />

            <CartDrawer
                isOpen={isCartOpen}
                onClose={() => {
                    setIsCartOpen(false);
                }}
            />

            <main>
                <Outlet />
            </main>
        </>
    );
}

export function CustomerLayout() {
    return (
        <CartProvider>
            <CustomerContent />
        </CartProvider>
    );
}