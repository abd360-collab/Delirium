import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useCartContext } from "../../../context/CartContext";

import { createOrder, getOrder } from "../../../api/order.api";
import {
    createPaymentOrder,
    verifyPayment,
} from "../../../api/payment.api";

import {
    getAddresses,
    type SavedAddress,
} from "../../../api/address.api";

import type { Order } from "../../../types/order.types";
import type { RazorpayPaymentResponse } from "../../../types/razorpay.types";
import { formatInr } from "../../../utils/currency";
import { ApiError } from "../../../lib/api/api-error";

const RESTAURANT_LATITUDE = 22.503053546678277;
const RESTAURANT_LONGITUDE = 88.36097805582347;
const DELIVERY_RADIUS_KM = 5;

type CustomerLocation = {
    latitude: number;
    longitude: number;
};

function calculateDistanceKm(
    latitude1: number,
    longitude1: number,
    latitude2: number,
    longitude2: number,
): number {
    const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

    const latitudeDifference = toRadians(latitude2 - latitude1);
    const longitudeDifference = toRadians(longitude2 - longitude1);

    const haversine =
        Math.sin(latitudeDifference / 2) ** 2 +
        Math.cos(toRadians(latitude1)) *
            Math.cos(toRadians(latitude2)) *
            Math.sin(longitudeDifference / 2) ** 2;

    const boundedHaversine = Math.min(1, Math.max(0, haversine));

    return (
        6371 *
        2 *
        Math.atan2(
            Math.sqrt(boundedHaversine),
            Math.sqrt(1 - boundedHaversine),
        )
    );
}

function isValidLocation(
    location: CustomerLocation | null,
): location is CustomerLocation {
    return (
        location !== null &&
        Number.isFinite(location.latitude) &&
        Number.isFinite(location.longitude) &&
        location.latitude >= -90 &&
        location.latitude <= 90 &&
        location.longitude >= -180 &&
        location.longitude <= 180
    );
}






export function CheckoutPage() {
    const { cart, isLoading, clearCartState } = useCartContext();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);

    const [phoneNumber, setPhoneNumber] = useState("");
    const [deliveryAddress, setDeliveryAddress] = useState("");

    const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState("");
    const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
    const [addressLoadError, setAddressLoadError] = useState<string | null>(
        null,
    );

    const [customerLocation, setCustomerLocation] =
        useState<CustomerLocation | null>(null);

    const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
    const [paymentMessage, setPaymentMessage] = useState<string | null>(null);
    const [paymentError, setPaymentError] = useState<string | null>(null);
    const [checkoutError, setCheckoutError] = useState<string | null>(null);

    const deliveryDistanceKm = isValidLocation(customerLocation)
        ? calculateDistanceKm(
              RESTAURANT_LATITUDE,
              RESTAURANT_LONGITUDE,
              customerLocation.latitude,
              customerLocation.longitude,
          )
        : null;

    const isDeliveryAvailable =
        deliveryDistanceKm !== null &&
        deliveryDistanceKm <= DELIVERY_RADIUS_KM;

    const isDeliveryDetailsValid =
        /^\d{10,15}$/.test(phoneNumber.trim()) &&
        deliveryAddress.trim().length >= 5 &&
        isValidLocation(customerLocation) &&
        isDeliveryAvailable;

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

    useEffect(() => {
        let cancelled = false;

        async function loadSavedAddresses() {
            try {
                setIsLoadingAddresses(true);
                setAddressLoadError(null);

                const addresses = await getAddresses();

                if (cancelled) return;

                setSavedAddresses(addresses);

                const defaultAddress =
                    addresses.find((address) => address.isDefault) ??
                    addresses[0];

                if (defaultAddress) {
                    setSelectedAddressId(defaultAddress.id);
                    setPhoneNumber(defaultAddress.phoneNumber);
                    setDeliveryAddress(defaultAddress.addressLine);

                    setCustomerLocation({
                        latitude: defaultAddress.latitude,
                        longitude: defaultAddress.longitude,
                    });
                }
            } catch (error) {
                if (cancelled) return;

                console.error("Failed to load saved addresses:", error);

                setAddressLoadError(
                    "We couldn't load your saved addresses. Please try again or manage your addresses from your profile.",
                );
            } finally {
                if (!cancelled) {
                    setIsLoadingAddresses(false);
                }
            }
        }

        void loadSavedAddresses();

        return () => {
            cancelled = true;
        };
    }, []);

    function handleAddressSelection(addressId: string) {
        setSelectedAddressId(addressId);
        setCheckoutError(null);

        if (!addressId) {
            setPhoneNumber("");
            setDeliveryAddress("");
            setCustomerLocation(null);
            return;
        }

        const selectedAddress = savedAddresses.find(
            (address) => address.id === addressId,
        );

        if (!selectedAddress) return;

        setPhoneNumber(selectedAddress.phoneNumber);
        setDeliveryAddress(selectedAddress.addressLine);

        setCustomerLocation({
            latitude: selectedAddress.latitude,
            longitude: selectedAddress.longitude,
        });
    }

    async function handlePlaceOrder() {
        if (isSubmitting || isPaymentOpen) return;

        setCheckoutError(null);

        const location = customerLocation;

        if (!isDeliveryDetailsValid || !isValidLocation(location)) {
            setCheckoutError(
                "Please select a valid saved address within our delivery area and check your phone number before continuing.",
            );
            return;
        }

        try {
            setIsSubmitting(true);

            const order = await createOrder({
                phoneNumber: phoneNumber.trim(),
                deliveryAddress: deliveryAddress.trim(),
                latitude: location.latitude,
                longitude: location.longitude,
            });

            const paymentOrder = await createPaymentOrder(order.id);

            const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;

            if (!razorpayKey) {
                throw new Error(
                    "Payment is not configured correctly. Please contact the restaurant before trying again.",
                );
            }

            const razorpayOptions = {
                key: razorpayKey,
                amount: paymentOrder.amountInPaise,
                currency: paymentOrder.currency,
                name: "DELIRIUM",
                description: `Order ${order.id}`,
                order_id: paymentOrder.gatewayOrderId,

                handler: async (response: RazorpayPaymentResponse) => {
                    try {
                        const verification = await verifyPayment(response);

                        clearCartState();

                        try {
                            const confirmedOrder = await getOrder(
                                verification.orderId,
                            );

                            if (confirmedOrder.status === "CONFIRMED") {
                                setCreatedOrder(confirmedOrder);
                            } else {
                                setPaymentMessage(
                                    "Your payment was received, but your order is still being processed. Please check your orders for the latest status.",
                                );
                            }
                        } catch (orderFetchError) {
                            console.error(
                                "Payment verified, but order status could not be fetched:",
                                orderFetchError,
                            );

                            setPaymentMessage(
                                "Your payment was verified, but we couldn't refresh your order status. Please check My Orders for the latest update.",
                            );
                        }
                    } catch (verificationError) {
                        console.error(
                            "Payment verification failed:",
                            verificationError,
                        );

                        setPaymentError(
                            "We couldn't confirm your payment status right now. Please check My Orders before attempting another payment.",
                        );
                    } finally {
                        setIsPaymentOpen(false);
                    }
                },

                modal: {
                    ondismiss: () => {
                        setIsPaymentOpen(false);
                        setCheckoutError(
                            "The payment window was closed. Your order may still be pending, so check My Orders before trying again.",
                        );
                    },
                },
            };

            const razorpay = new window.Razorpay(razorpayOptions);

            setIsPaymentOpen(true);
            razorpay.open();
                    } catch (error) {
            console.error("Checkout failed:", error);

            if (error instanceof ApiError) {
                setCheckoutError(error.message);
            } else {
                setCheckoutError(
                    "We couldn't start checkout or initialize payment. If an order was created, check My Orders before placing another one.",
                );
            }

            setIsPaymentOpen(false);
        } finally {
            setIsSubmitting(false);
        }
    }

    if (isLoading) {
        return (
            <section className="checkout-page">
                <p className="checkout-page__loading" role="status">
                    Preparing your checkout...
                </p>
            </section>
        );
    }

    if (createdOrder) {
        return (
            <section className="checkout-page">
                <div className="checkout-page__success" role="status">
                    <span className="checkout-page__eyebrow">
                        MADE FOR YOUR CRAVINGS
                    </span>

                    <h1 className="checkout-page__success-title">
                        Order Confirmed
                    </h1>

                    <p className="checkout-page__success-text">
                        Your payment was successful and your order has been
                        confirmed. We're getting things ready for you.
                    </p>

                    <p className="checkout-page__success-order">
                        Order ID: {createdOrder.id}
                    </p>

                    <Link to="/orders" className="checkout-page__success-link">
                        View My Orders
                    </Link>

                    <Link to="/menu" className="checkout-page__success-link">
                        Continue Shopping
                    </Link>
                </div>
            </section>
        );
    }

    if (paymentError) {
        return (
            <section className="checkout-page">
                <div className="checkout-page__error" role="alert">
                    <span className="checkout-page__eyebrow">
                        PAYMENT STATUS
                    </span>

                    <h1 className="checkout-page__error-title">
                        Verification Pending
                    </h1>

                    <p className="checkout-page__error-text">
                        {paymentError}
                    </p>

                    <Link to="/orders" className="checkout-page__error-link">
                        Check My Orders
                    </Link>

                    <Link to="/menu" className="checkout-page__error-link">
                        Return to Menu
                    </Link>
                </div>
            </section>
        );
    }

    if (paymentMessage) {
        return (
            <section className="checkout-page">
                <div className="checkout-page__success" role="status">
                    <span className="checkout-page__eyebrow">
                        PAYMENT UPDATE
                    </span>

                    <h1 className="checkout-page__success-title">
                        Payment Received
                    </h1>

                    <p className="checkout-page__success-text">
                        {paymentMessage}
                    </p>

                    <Link to="/orders" className="checkout-page__success-link">
                        View My Orders
                    </Link>

                    <Link to="/menu" className="checkout-page__success-link">
                        Continue Shopping
                    </Link>
                </div>
            </section>
        );
    }

    if (items.length === 0) {
        return (
            <section className="checkout-page">
                <div className="checkout-page__empty">
                    <span className="checkout-page__eyebrow">
                        ONE MORE BITE?
                    </span>

                    <h1 className="checkout-page__empty-title">
                        Your cart is empty
                    </h1>

                    <p className="checkout-page__empty-text">
                        Add something delicious from the menu before checking
                        out.
                    </p>

                    <Link to="/menu" className="checkout-page__empty-link">
                        Explore the Menu
                    </Link>
                </div>
            </section>
        );
    }

    return (
        <section className="checkout-page">
            <header className="checkout-page__header">
                <div>
                    <span className="checkout-page__eyebrow">
                        JUST ONE STEP AWAY
                    </span>

                    <h1 className="checkout-page__title">Checkout</h1>
                </div>

                <Link to="/cart" className="checkout-page__back">
                    <span aria-hidden="true">←</span> Back to Cart
                </Link>
            </header>

            <section
                className="checkout-page__delivery"
                aria-labelledby="checkout-delivery-title"
            >
                <div className="checkout-page__section-heading">
                    <div>
                        <span className="checkout-page__eyebrow">
                            DELIVERY
                        </span>

                        <h2 id="checkout-delivery-title">
                            Where should we deliver?
                        </h2>
                    </div>
                </div>

                <div className="checkout-page__delivery-fields">
                    <div className="checkout-page__field checkout-page__field--address">
                        <label htmlFor="savedAddress">Delivery address</label>

                        <select
                            id="savedAddress"
                            value={selectedAddressId}
                            onChange={(event) =>
                                handleAddressSelection(event.target.value)
                            }
                            disabled={isLoadingAddresses}
                        >
                            <option value="">Select a saved address</option>

                            {savedAddresses.map((address) => (
                                <option key={address.id} value={address.id}>
                                    {address.label}
                                    {address.isDefault ? " (Default)" : ""}
                                    {" — "}
                                    {address.addressLine}
                                </option>
                            ))}
                        </select>

                        {deliveryAddress && (
                            <p className="checkout-page__address-preview">
                                {deliveryAddress}
                            </p>
                        )}

                        {isLoadingAddresses && (
                            <p
                                className="checkout-page__field-hint"
                                role="status"
                            >
                                Loading addresses...
                            </p>
                        )}

                        {addressLoadError && (
                            <p
                                className="checkout-page__field-hint checkout-page__field-hint--error"
                                role="alert"
                            >
                                {addressLoadError}
                            </p>
                        )}

                        {!isLoadingAddresses &&
                            savedAddresses.length === 0 && (
                                <p className="checkout-page__field-hint">
                                    No saved addresses.{" "}
                                    <Link to="/profile">
                                        Add one in your profile
                                    </Link>
                                    .
                                </p>
                            )}

                        {savedAddresses.length > 0 && (
                            <Link
                                to="/profile"
                                className="checkout-page__manage-addresses"
                            >
                                Manage addresses
                            </Link>
                        )}
                    </div>

                    <div className="checkout-page__field checkout-page__field--phone">
                        <label htmlFor="phoneNumber">
                            Phone number
                            <span className="required-asterisk"> *</span>
                        </label>

                        <input
                            id="phoneNumber"
                            name="phoneNumber"
                            type="tel"
                            value={phoneNumber}
                            onChange={(event) => {
                                setPhoneNumber(event.target.value);
                                setCheckoutError(null);
                            }}
                            placeholder="Enter phone number"
                            autoComplete="tel"
                            inputMode="numeric"
                            maxLength={15}
                            required
                        />

                        <p className="checkout-page__field-hint">
                            10–15 digits
                        </p>
                    </div>
                </div>

                <div
                    className={`checkout-page__delivery-status ${
                        isDeliveryAvailable
                            ? "checkout-page__delivery-status--available"
                            : deliveryDistanceKm !== null
                              ? "checkout-page__delivery-status--unavailable"
                              : ""
                    }`}
                    role="status"
                    aria-live="polite"
                >
                    {deliveryDistanceKm === null ? (
                        <p>Select an address to check delivery availability.</p>
                    ) : isDeliveryAvailable ? (
                        <p>
                            <strong>Delivery available</strong>
                            <span>
                                {deliveryDistanceKm.toFixed(2)} km from the
                                restaurant
                            </span>
                        </p>
                    ) : (
                        <p>
                            <strong>Outside delivery area</strong>
                            <span>
                                {deliveryDistanceKm.toFixed(2)} km away.
                                Delivery is available within{" "}
                                {DELIVERY_RADIUS_KM} km.
                            </span>
                        </p>
                    )}
                </div>
            </section>

            <div className="checkout-page__content">
                <section
                    className="checkout-page__items"
                    aria-labelledby="checkout-order-title"
                >
                    <div className="checkout-page__section-heading">
                        <div>
                            <span className="checkout-page__eyebrow">
                                YOUR SELECTION
                            </span>

                            <h2
                                id="checkout-order-title"
                                className="checkout-page__section-title"
                            >
                                Your order
                            </h2>

                            <p className="checkout-page__items-count">
                                {totalQuantity}{" "}
                                {totalQuantity === 1 ? "item" : "items"}
                            </p>
                        </div>
                    </div>

                    {items.map((item) => (
                        <article
                            key={item.id}
                            className="checkout-page__item"
                        >
                            <div className="checkout-page__item-info">
                                <h3 className="checkout-page__item-name">
                                    {item.menuItem.name}
                                </h3>

                                <p className="checkout-page__item-quantity">
                                    {item.quantity} ×{" "}
                                    {formatInr(item.menuItem.priceInPaise)}
                                </p>
                            </div>

                            <span className="checkout-page__item-total">
                                {formatInr(
                                    item.menuItem.priceInPaise * item.quantity,
                                )}
                            </span>
                        </article>
                    ))}
                </section>

                <aside
                    className="checkout-page__summary"
                    aria-labelledby="checkout-summary-title"
                >
                    <span className="checkout-page__eyebrow">
                        DELIRIUM
                    </span>

                    <h2
                        id="checkout-summary-title"
                        className="checkout-page__summary-title"
                    >
                        Order summary
                    </h2>

                    <div className="checkout-page__summary-row">
                        <span>
                            Subtotal · {totalQuantity}{" "}
                            {totalQuantity === 1 ? "item" : "items"}
                        </span>

                        <strong>{formatInr(subtotalInPaise)}</strong>
                    </div>

                    <p className="checkout-page__summary-note">
                        Delivery charges, if applicable, will be shown before
                        payment.
                    </p>

                    {checkoutError && (
                        <p
                            className="checkout-page__checkout-error"
                            role="alert"
                        >
                            {checkoutError}
                        </p>
                    )}

                    <button
                        type="button"
                        className="checkout-page__submit"
                        disabled={
                            isSubmitting ||
                            isPaymentOpen ||
                            isLoadingAddresses ||
                            !isDeliveryDetailsValid
                        }
                        onClick={() => {
                            void handlePlaceOrder();
                        }}
                    >
                        {isPaymentOpen
                            ? "Payment in progress..."
                            : isSubmitting
                              ? "Preparing order..."
                              : "Place order & pay"}
                    </button>

                    <p className="checkout-page__secure-note">
                        Secure payment by Razorpay
                    </p>

                    {!isDeliveryDetailsValid && !isLoadingAddresses && (
                        <p className="checkout-page__validation-note">
                            {deliveryDistanceKm !== null &&
                            !isDeliveryAvailable
                                ? "Your address is outside our delivery area."
                                : !selectedAddressId
                                  ? "Select a delivery address to continue."
                                  : "Enter a valid phone number to continue."}
                        </p>
                    )}
                </aside>
            </div>
        </section>
    );
}