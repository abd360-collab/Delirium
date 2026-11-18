
import { Link } from "react-router-dom";

import { useCartContext } from "../../../context/CartContext";

const formatInr = (amountInPaise: number): string =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amountInPaise / 100);

export function CartPage() {
    const {
        cart,
        isLoading,
        updateItem,
        removeItem,
    } = useCartContext();

    const items = cart?.items ?? [];

    const subtotalInPaise = items.reduce(
        (total, item) =>
            total + item.menuItem.priceInPaise * item.quantity,
        0,
    );

    const totalQuantity = items.reduce(
        (total, item) => total + item.quantity,
        0,
    );

    return (
        <section className="cart-page" aria-labelledby="cart-page-title">
            <header className="cart-page__header">
                <div className="cart-page__heading">
                    <p className="cart-page__eyebrow">
                        YOUR DELIRIUM
                    </p>

                    <h1
                        id="cart-page-title"
                        className="cart-page__title"
                    >
                        Your Cart
                    </h1>
                </div>

                <Link
                    to="/menu"
                    className="cart-page__continue"
                >
                    Continue Shopping
                    <span aria-hidden="true"> ↗</span>
                </Link>
            </header>

            {isLoading ? (
                <p
                    className="cart-page__loading"
                    role="status"
                    aria-live="polite"
                >
                    Loading your cart...
                </p>
            ) : items.length === 0 ? (
                <div className="cart-page__empty">
                    <span
                        className="cart-page__empty-mark"
                        aria-hidden="true"
                    >
                        ✳
                    </span>

                    <p className="cart-page__eyebrow">
                        NOTHING HERE. YET.
                    </p>

                    <h2 className="cart-page__empty-title">
                        Your cart is empty.
                    </h2>

                    <p className="cart-page__empty-text">
                        Something delicious is waiting for you.
                        Explore the menu and find your next craving.
                    </p>

                    <Link
                        to="/menu"
                        className="cart-page__checkout"
                    >
                        Explore Menu
                        <span aria-hidden="true"> →</span>
                    </Link>
                </div>
            ) : (
                <div className="cart-page__content">
                    <div className="cart-page__items">
                        <div className="cart-page__items-heading">
                            <h2>Your selections</h2>

                            <span>
                                {totalQuantity}{" "}
                                {totalQuantity === 1 ? "item" : "items"}
                            </span>
                        </div>

                        {items.map((item) => (
                            <article
                                key={item.id}
                                className="cart-page__item"
                            >
                                <div className="cart-page__item-info">
                                    <h3 className="cart-page__item-name">
                                        {item.menuItem.name}
                                    </h3>

                                    <p className="cart-page__item-price">
                                        {formatInr(
                                            item.menuItem.priceInPaise,
                                        )}{" "}
                                        <span>each</span>
                                    </p>

                                    <p className="cart-page__item-total">
                                        {formatInr(
                                            item.menuItem.priceInPaise *
                                                item.quantity,
                                        )}
                                    </p>
                                </div>

                                <div className="cart-page__item-actions">
                                    <div
                                        className="cart-page__quantity"
                                        aria-label={`Quantity of ${item.menuItem.name}`}
                                    >
                                        <button
                                            type="button"
                                            className="cart-page__quantity-button"
                                            onClick={() => {
                                                void updateItem(
                                                    item.id,
                                                    item.quantity - 1,
                                                );
                                            }}
                                            disabled={item.quantity <= 1}
                                            aria-label={`Decrease quantity of ${item.menuItem.name}`}
                                        >
                                            −
                                        </button>

                                        <span
                                            className="cart-page__quantity-value"
                                            aria-live="polite"
                                        >
                                            {item.quantity}
                                        </span>

                                        <button
                                            type="button"
                                            className="cart-page__quantity-button"
                                            onClick={() => {
                                                void updateItem(
                                                    item.id,
                                                    item.quantity + 1,
                                                );
                                            }}
                                            aria-label={`Increase quantity of ${item.menuItem.name}`}
                                        >
                                            +
                                        </button>
                                    </div>

                                    <button
                                        type="button"
                                        className="cart-page__remove"
                                        onClick={() => {
                                            void removeItem(item.id);
                                        }}
                                        aria-label={`Remove ${item.menuItem.name} from cart`}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </article>
                        ))}

                        <Link
                            to="/menu"
                            className="cart-page__add-more"
                        >
                            <span aria-hidden="true">+</span>
                            Add something else
                        </Link>
                    </div>

                    <aside
                        className="cart-page__summary"
                        aria-labelledby="cart-summary-title"
                    >
                        <p className="cart-page__summary-eyebrow">
                            THE GOOD STUFF
                        </p>

                        <h2
                            id="cart-summary-title"
                            className="cart-page__summary-title"
                        >
                            Order Summary
                        </h2>

                        <div className="cart-page__summary-row">
                            <span className="cart-page__summary-label">
                                Items ({totalQuantity})
                            </span>

                            <span className="cart-page__summary-total">
                                {formatInr(subtotalInPaise)}
                            </span>
                        </div>

                        <p className="cart-page__summary-note">
                            Delivery charges and any applicable fees
                            will be shown before you pay.
                        </p>

                        <div className="cart-page__summary-divider" />

                        <div className="cart-page__summary-row cart-page__summary-row--total">
                            <span className="cart-page__summary-label">
                                Subtotal
                            </span>

                            <span className="cart-page__summary-total">
                                {formatInr(subtotalInPaise)}
                            </span>
                        </div>

                        <Link
                            to="/checkout"
                            className="cart-page__checkout"
                        >
                            Proceed to Checkout
                            <span aria-hidden="true"> →</span>
                        </Link>

                        <p className="cart-page__secure-note">
                            Made for cravings. Prepared with care.
                        </p>
                    </aside>
                </div>
            )}
        </section>
    );
}
