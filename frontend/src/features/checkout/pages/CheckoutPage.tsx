import { useState } from "react";
import { Link } from "react-router-dom";

import { useCartContext } from "../../../context/CartContext";

import {
    createOrder,
    getOrder,
} from "../../../api/order.api";

import {
    createPaymentOrder,
    verifyPayment,
} from "../../../api/payment.api";

import type { Order } from "../../../types/order.types";
import type { RazorpayPaymentResponse } from "../../../types/razorpay.types";

export function CheckoutPage() {
    const {
        cart,
        isLoading,
    } = useCartContext();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [createdOrder, setCreatedOrder] =
        useState<Order | null>(null);

    const subtotalInPaise =
        cart?.items.reduce(
            (total, item) =>
                total +
                item.menuItem.priceInPaise * item.quantity,
            0,
        ) ?? 0;

    if (isLoading) {
        return (
            <section className="checkout-page">
                <p className="checkout-page__loading">
                    Loading checkout...
                </p>
            </section>
        );
    }

    if (createdOrder) {
        return (
            <section className="checkout-page">
                <div className="checkout-page__success">
                    <h1 className="checkout-page__success-title">
                        Order Confirmed
                    </h1>

                    <p className="checkout-page__success-text">
                        Your payment was successful and your order has been confirmed.
                    </p>

                    <p className="checkout-page__success-order">
                        Order ID: {createdOrder.id}
                    </p>

                    <Link
                        to="/orders"
                        className="checkout-page__success-link"
                    >
                        View My Orders
                    </Link>

                    <Link
                        to="/menu"
                        className="checkout-page__success-link"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </section>
        );
    }

    if (!cart || cart.items.length === 0) {
        return (
            <section className="checkout-page">
                <div className="checkout-page__empty">
                    <h1 className="checkout-page__empty-title">
                        Your cart is empty
                    </h1>

                    <p className="checkout-page__empty-text">
                        Add something from the menu before checking out.
                    </p>

                    <Link
                        to="/menu"
                        className="checkout-page__back"
                    >
                        Back to Menu
                    </Link>
                </div>
            </section>
        );
    }

    return (
        <section className="checkout-page">
            <div className="checkout-page__header">
                <h1 className="checkout-page__title">
                    Checkout
                </h1>

                <Link
                    to="/cart"
                    className="checkout-page__back"
                >
                    Back to Cart
                </Link>
            </div>

            <div className="checkout-page__content">
                <div className="checkout-page__items">
                    <h2 className="checkout-page__section-title">
                        Your Order
                    </h2>

                    {cart.items.map((item) => (
                        <article
                            key={item.id}
                            className="checkout-page__item"
                        >
                            <div className="checkout-page__item-info">
                                <h3 className="checkout-page__item-name">
                                    {item.menuItem.name}
                                </h3>

                                <p className="checkout-page__item-quantity">
                                    Quantity: {item.quantity}
                                </p>
                            </div>

                            <span className="checkout-page__item-total">
                                ₹
                                {(item.menuItem.priceInPaise *
                                    item.quantity) /
                                    100}
                            </span>
                        </article>
                    ))}
                </div>

                <aside className="checkout-page__summary">
                    <h2 className="checkout-page__summary-title">
                        Order Summary
                    </h2>

                    <div className="checkout-page__summary-row">
                        <span>
                            Subtotal
                        </span>

                        <strong>
                            ₹{subtotalInPaise / 100}
                        </strong>
                    </div>

                    <button
                        type="button"
                        className="checkout-page__submit"
                        disabled={isSubmitting}
                        onClick={async () => {
                            try {
                                setIsSubmitting(true);

                                const order = await createOrder();
                                setCreatedOrder(order);

                                const paymentOrder =
                                    await createPaymentOrder(order.id);

                                const razorpayOptions = {
                                    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                                    amount: paymentOrder.amountInPaise,
                                    currency: paymentOrder.currency,
                                    name: "DELIRIUM",
                                    description: `Order ${order.id}`,
                                    order_id: paymentOrder.gatewayOrderId,

                                    handler: async (
                                        response: RazorpayPaymentResponse,
                                    ) => {
                                        try {
                                            const verification =
                                                await verifyPayment(response);

                                            const confirmedOrder =
                                                await getOrder(
                                                    verification.orderId,
                                                );

                                            setCreatedOrder(
                                                confirmedOrder,
                                            );

                                            console.log(
                                                "Payment verified:",
                                                verification,
                                            );

                                            console.log(
                                                "Updated order:",
                                                confirmedOrder,
                                            );
                                        } catch (error) {
                                            console.error(
                                                "Payment verification failed:",
                                                error,
                                            );
                                        }
                                    },
                                };

                                const razorpay =
                                    new window.Razorpay(
                                        razorpayOptions,
                                    );

                                razorpay.open();

                                console.log(
                                    "Order created:",
                                    order,
                                );

                                console.log(
                                    "Payment order created:",
                                    paymentOrder,
                                );
                            } catch (error) {
                                console.error(
                                    "Checkout failed:",
                                    error,
                                );
                            } finally {
                                setIsSubmitting(false);
                            }
                        }}
                    >
                        {isSubmitting
                            ? "Creating Order..."
                            : "Place Order & Pay"}
                    </button>
                </aside>
            </div>
        </section>
    );
}