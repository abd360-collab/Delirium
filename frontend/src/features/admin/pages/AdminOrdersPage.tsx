
import { useCallback, useEffect, useState } from "react";
import {
    getAdminOrders,
    updateAdminOrderStatus,
} from "../../../api/order.api";
import type {
    Order,
    OrderStatus,
    OrderItem,
} from "../../../types/order.types";
import { useAdminRealtime } from "../../../hooks/useAdminRealtime";

const nextStatuses: Partial<Record<OrderStatus, OrderStatus[]>> = {
    PENDING: ["CONFIRMED", "CANCELLED"],
    CONFIRMED: ["PREPARING", "CANCELLED"],
    PREPARING: ["READY"],
    READY: ["OUT_FOR_DELIVERY"],
    OUT_FOR_DELIVERY: ["DELIVERED"],
};

const statusLabels: Record<OrderStatus, string> = {
    PENDING: "Pending",
    CONFIRMED: "Confirmed",
    PREPARING: "Preparing",
    READY: "Ready",
    OUT_FOR_DELIVERY: "Out for delivery",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
};

function formatCurrency(amountInPaise: number): string {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(amountInPaise / 100);
}

function formatDate(date: string): string {
    return new Date(date).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

function getGoogleMapsUrl(
    latitude: number,
    longitude: number,
): string {
    return `https://www.google.com/maps?q=${latitude},${longitude}`;
}

function hasDeliveryCoordinates(order: Order): boolean {
    return (
        typeof order.deliveryLatitude === "number" &&
        Number.isFinite(order.deliveryLatitude) &&
        order.deliveryLatitude >= -90 &&
        order.deliveryLatitude <= 90 &&
        typeof order.deliveryLongitude === "number" &&
        Number.isFinite(order.deliveryLongitude) &&
        order.deliveryLongitude >= -180 &&
        order.deliveryLongitude <= 180
    );
}

export function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(
        null,
    );
    const [refreshKey, setRefreshKey] = useState(0);

    const fetchOrders = useCallback(async (signal: AbortSignal) => {
        try {
            const data = await getAdminOrders();

            if (signal.aborted) return;

            setOrders(data);
            setError("");
        } catch {
            if (signal.aborted) return;

            setError("Could not load orders. Please try again.");
        } finally {
            if (!signal.aborted) {
                setIsLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        const controller = new AbortController();

        const timeoutId = setTimeout(() => {
            void fetchOrders(controller.signal);
        }, 0);

        return () => {
            clearTimeout(timeoutId);
            controller.abort();
        };
    }, [fetchOrders, refreshKey]);

    const loadOrders = useCallback(() => {
        if (orders.length === 0) {
            setIsLoading(true);
        }

        setRefreshKey((current) => current + 1);
    }, [orders.length]);

    useAdminRealtime({
        onNewOrder: () => {
            loadOrders();
        },

        onOrderStatusChanged: (event) => {
            setOrders((currentOrders) =>
                currentOrders.map((order) =>
                    order.id === event.orderId
                        ? { ...order, status: event.newStatus }
                        : order,
                ),
            );
        },
    });

    async function handleStatusChange(
        orderId: string,
        status: OrderStatus,
    ) {
        setUpdatingOrderId(orderId);
        setError("");

        try {
            const updatedOrder = await updateAdminOrderStatus(
                orderId,
                status,
            );

            setOrders((currentOrders) =>
                currentOrders.map((order) =>
                    order.id === orderId ? updatedOrder : order,
                ),
            );
        } catch {
            setError("Could not update the order status. Please try again.");
        } finally {
            setUpdatingOrderId(null);
        }
    }

    return (
        <section className="admin-dashboard">
            <div className="admin-dashboard__header">
                <div>
                    <p className="admin-dashboard__eyebrow">
                        RESTAURANT MANAGEMENT
                    </p>
                    <h1>Orders</h1>
                    <p>Review customer orders and manage their progress.</p>
                </div>

                <button
                    type="button"
                    className="admin-refresh-button"
                    onClick={loadOrders}
                    disabled={isLoading}
                >
                    {isLoading ? "Loading..." : "Refresh orders"}
                </button>
            </div>

            {error && (
                <p className="admin-error" role="alert">
                    {error}
                </p>
            )}

            {isLoading ? (
                <p role="status">Loading orders...</p>
            ) : orders.length === 0 ? (
                <div className="admin-dashboard__empty">
                    <h3>No orders yet</h3>
                    <p>New customer orders will appear here.</p>
                </div>
            ) : (
                <div className="admin-order-list">
                    {orders.map((order) => {
                        const availableStatuses =
                            nextStatuses[order.status] ?? [];

                        const hasCoordinates =
                            hasDeliveryCoordinates(order);

                        return (
                            <article
                                className="admin-order-card"
                                key={order.id}
                            >
                                <div className="admin-order-card__header">
                                    <div>
                                        <h3>
                                            Order #{order.id.slice(-8)}
                                        </h3>
                                        <p>{formatDate(order.createdAt)}</p>
                                    </div>

                                    <span
                                        className={`admin-order-status admin-order-status--${order.status.toLowerCase()}`}
                                    >
                                        {statusLabels[order.status]}
                                    </span>
                                </div>

                                <div className="admin-order-card__customer">
                                    <h4>Customer &amp; delivery</h4>

                                    <p>
                                        <strong>Phone:</strong>{" "}
                                        {order.phoneNumber || "Not provided"}
                                    </p>

                                    <p>
                                        <strong>Address:</strong>{" "}
                                        {order.deliveryAddress ||
                                            "No address provided"}
                                    </p>

                                    {hasCoordinates ? (
                                        <div className="admin-order-location">
                                            <p className="admin-order-location__coordinates">
                                                <strong>
                                                    Saved delivery coordinates:
                                                </strong>{" "}
                                                {order.deliveryLatitude!.toFixed(
                                                    6,
                                                )}
                                                ,{" "}
                                                {order.deliveryLongitude!.toFixed(
                                                    6,
                                                )}
                                            </p>

                                            <a
                                                className="admin-order-location__link"
                                                href={getGoogleMapsUrl(
                                                    order.deliveryLatitude!,
                                                    order.deliveryLongitude!,
                                                )}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                aria-label={`Open exact delivery location for order ${order.id} in Google Maps`}
                                            >
                                                <span aria-hidden="true">
                                                    📍
                                                </span>{" "}
                                                Open Location in Google Maps
                                                <span aria-hidden="true">
                                                    ↗
                                                </span>
                                            </a>
                                        </div>
                                    ) : (
                                        <p className="admin-order-location__unavailable">
                                            Exact map location is unavailable
                                            for this order.
                                        </p>
                                    )}
                                </div>

                                <div className="admin-order-card__items">
                                    <h4>Items</h4>

                                    {order.items.map(
                                        (item: OrderItem) => (
                                            <div
                                                className="admin-order-item"
                                                key={item.id}
                                            >
                                                <span>
                                                    {item.name} ×{" "}
                                                    {item.quantity}
                                                </span>

                                                <span>
                                                    {formatCurrency(
                                                        item.unitPriceInPaise *
                                                            item.quantity,
                                                    )}
                                                </span>
                                            </div>
                                        ),
                                    )}
                                </div>

                                <div className="admin-order-card__footer">
                                    <strong>
                                        Total:{" "}
                                        {formatCurrency(order.totalInPaise)}
                                    </strong>

                                    {availableStatuses.length > 0 && (
                                        <div className="admin-order-actions">
                                            {availableStatuses.map(
                                                (status) => (
                                                    <button
                                                        type="button"
                                                        key={status}
                                                        className="admin-refresh-button"
                                                        disabled={
                                                            updatingOrderId ===
                                                            order.id
                                                        }
                                                        onClick={() =>
                                                            void handleStatusChange(
                                                                order.id,
                                                                status,
                                                            )
                                                        }
                                                    >
                                                        {updatingOrderId ===
                                                        order.id
                                                            ? "Updating..."
                                                            : status ===
                                                                "CANCELLED"
                                                              ? "Cancel order"
                                                              : `Mark ${statusLabels[status]}`}
                                                    </button>
                                                ),
                                            )}
                                        </div>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
