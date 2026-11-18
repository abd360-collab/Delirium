
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { useAuth } from "../../../../hooks/useAuth";

interface CustomerHeaderProps {
    cartItemCount: number;
}

export function CustomerHeader({
    cartItemCount,
}: CustomerHeaderProps) {
    const { user, isAuthenticated, logout } = useAuth();
    const location = useLocation();

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const mobileMenuRef = useRef<HTMLDivElement>(null);
    const menuToggleRef = useRef<HTMLButtonElement>(null);

    // Close the menu when Escape is pressed.
    useEffect(() => {
        if (!isMobileMenuOpen) {
            return;
        }

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setIsMobileMenuOpen(false);
            }
        }

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isMobileMenuOpen]);

    // Close the menu when clicking outside the menu and toggle button.
    useEffect(() => {
        if (!isMobileMenuOpen) {
            return;
        }

        function handlePointerDown(event: PointerEvent) {
            const target = event.target;

            if (!(target instanceof Node)) {
                return;
            }

            const clickedInsideMenu =
                mobileMenuRef.current?.contains(target);

            const clickedToggleButton =
                menuToggleRef.current?.contains(target);

            if (!clickedInsideMenu && !clickedToggleButton) {
                setIsMobileMenuOpen(false);
            }
        }

        document.addEventListener("pointerdown", handlePointerDown);

        return () => {
            document.removeEventListener(
                "pointerdown",
                handlePointerDown,
            );
        };
    }, [isMobileMenuOpen]);

    function closeMobileMenu() {
        setIsMobileMenuOpen(false);
    }

    async function handleLogout() {
        closeMobileMenu();
        await logout();
    }

    function scrollToSection(sectionId: string) {
        closeMobileMenu();

        if (location.pathname === "/") {
            window.setTimeout(() => {
                document.getElementById(sectionId)?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            }, 0);
        }
    }

    return (
        <header className="site-header">
            <div className="site-header__inner">
                <Link
                    to="/"
                    className="site-header__brand"
                    aria-label="Delirium home"
                    onClick={closeMobileMenu}
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

                    <Link
                        to="/#featured"
                        onClick={() => scrollToSection("featured")}
                    >
                        Featured
                    </Link>

                    <Link
                        to="/#about"
                        onClick={() => scrollToSection("about")}
                    >
                        About
                    </Link>
                </nav>

                <div className="site-header__actions">
                    {isAuthenticated && user?.name && (
                        <span className="site-header__user">
                            {user.name}
                        </span>
                    )}

                    {isAuthenticated && user?.role === "CUSTOMER" && (
                        <>
                            <Link
                                to="/orders"
                                className="site-header__profile"
                                onClick={closeMobileMenu}
                            >
                                My Orders
                            </Link>

                            <Link
                                to="/profile"
                                className="site-header__profile"
                                onClick={closeMobileMenu}
                            >
                                Profile
                            </Link>
                        </>
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
                        aria-label={`Cart with ${cartItemCount} ${
                            cartItemCount === 1 ? "item" : "items"
                        }`}
                        onClick={closeMobileMenu}
                    >
                        <span>Cart</span>

                        {cartItemCount > 0 && (
                            <span
                                className="site-header__cart-count"
                                aria-hidden="true"
                            >
                                {cartItemCount}
                            </span>
                        )}
                    </Link>

                    <button
                        ref={menuToggleRef}
                        type="button"
                        className="site-header__menu-toggle"
                        aria-label={
                            isMobileMenuOpen
                                ? "Close navigation menu"
                                : "Open navigation menu"
                        }
                        aria-expanded={isMobileMenuOpen}
                        aria-controls="site-mobile-navigation"
                        onClick={() => {
                            setIsMobileMenuOpen((open) => !open);
                        }}
                    >
                        <span
                            className={`site-header__menu-icon ${
                                isMobileMenuOpen
                                    ? "site-header__menu-icon--open"
                                    : ""
                            }`}
                            aria-hidden="true"
                        >
                            <span />
                            <span />
                            <span />
                        </span>
                    </button>
                </div>
            </div>

            <div
                ref={mobileMenuRef}
                id="site-mobile-navigation"
                className={`site-header__mobile-menu ${
                    isMobileMenuOpen
                        ? "site-header__mobile-menu--open"
                        : ""
                }`}
                aria-hidden={!isMobileMenuOpen}
                inert={!isMobileMenuOpen}
            >
                <nav
                    className="site-header__mobile-nav"
                    aria-label="Mobile navigation"
                >
                    <Link to="/" onClick={closeMobileMenu}>
                        Home
                    </Link>

                    <Link to="/menu" onClick={closeMobileMenu}>
                        Menu
                    </Link>

                    <Link
                        to="/#featured"
                        onClick={() => scrollToSection("featured")}
                    >
                        Featured
                    </Link>

                    <Link
                        to="/#about"
                        onClick={() => scrollToSection("about")}
                    >
                        About
                    </Link>

                    <Link to="/cart" onClick={closeMobileMenu}>
                        Cart

                        {cartItemCount > 0 && (
                            <span className="site-header__mobile-count">
                                {cartItemCount}
                            </span>
                        )}
                    </Link>

                    {isAuthenticated && user?.role === "CUSTOMER" && (
                        <>
                            <Link
                                to="/orders"
                                onClick={closeMobileMenu}
                            >
                                My Orders
                            </Link>

                            <Link
                                to="/profile"
                                onClick={closeMobileMenu}
                            >
                                Profile
                            </Link>
                        </>
                    )}
                </nav>

                {isAuthenticated && (
                    <div className="site-header__mobile-account">
                        {user?.name && (
                            <p className="site-header__mobile-user">
                                Signed in as{" "}
                                <strong>{user.name}</strong>
                            </p>
                        )}

                        <button
                            type="button"
                            className="site-header__mobile-logout"
                            onClick={() => {
                                void handleLogout();
                            }}
                        >
                            Log out
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}
