import { Link } from "react-router-dom";
import { useAuth } from "../../../../hooks/useAuth";



interface CustomerHeaderProps {
    cartItemCount: number;
}

export function CustomerHeader({
    cartItemCount,
}: CustomerHeaderProps) {
    const {
        user,
        isAuthenticated,
        logout,
    } = useAuth();

    async function handleLogout() {
        await logout();
    }

    return (
        <header className="site-header">
            <div className="site-header__inner">
                <Link
                    to="/"
                    className="site-header__brand"
                    aria-label="Delirium home"
                >
                    <span className="site-header__brand-name">
                        DELIRIUM
                    </span>

                    <span className="site-header__brand-tagline">
                        TASTE THE DISORIENTATION
                    </span>
                </Link>

                <nav
                    className="site-header__nav"
                    aria-label="Main navigation"
                >
                    <Link to="/menu">Menu</Link>
                    <Link to="/featured">Featured</Link>
                    <Link to="/about">About</Link>
                </nav>

                <div className="site-header__actions">
                    {isAuthenticated && (
                        <span className="site-header__user">
                            {user?.name}
                        </span>
                    )}

                    {isAuthenticated && (
                        <button
                            type="button"
                            className="site-header__logout"
                            onClick={() => {
                                void handleLogout();
                            }}
                        >
                            Logout
                        </button>
                    )}

                   <Link
    to="/cart"
    className="site-header__cart"
    aria-label={`Cart with ${cartItemCount} items`}
>
    Cart

    {cartItemCount > 0 && (
        <span className="site-header__cart-count">
            {cartItemCount}
        </span>
    )}
</Link>
                </div>
            </div>
        </header>
    );
}