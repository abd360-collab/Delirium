
import { useCallback, useEffect, useState } from "react";


import type { Order, OrderItem, OrderStatus } from "../../../types/order.types";
import { getAdminOrders } from "../../../api/order.api";
import { useAdminRealtime } from "../../../hooks/useAdminRealtime";


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
    return new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(date));
}

function getStatusClass(status: OrderStatus): string {
    return `admin-order-status admin-order-status--${status.toLowerCase()}`;
}

export function AdminDashboardPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    
const loadOrders = useCallback(async () => {
    try {
        if (orders.length === 0) {
    setIsLoading(true);
}

setError(null);

        const result = await getAdminOrders();
        setOrders(result);
    } catch {
        setError("Unable to load orders. Please try again.");
    } finally {
        setIsLoading(false);
    }
}, [orders.length]);

useEffect(() => {
    const timer = window.setTimeout(() => {
        void loadOrders();
    }, 0);

    return () => {
        window.clearTimeout(timer);
    };
}, [loadOrders]);

useAdminRealtime({
    onNewOrder: () => {
        void loadOrders();
    },
    onOrderStatusChanged: () => {
        void loadOrders();
    },
});


    const activeOrders = orders.filter((order) =>
        [
            "CONFIRMED",
            "PREPARING",
            "READY",
            "OUT_FOR_DELIVERY",
        ].includes(order.status),
    );

    const awaitingPreparation = orders.filter((order) =>
        ["PENDING", "CONFIRMED"].includes(order.status),
    );

    const deliveredOrders = orders.filter(
        (order) => order.status === "DELIVERED",
    );

    const recentOrders = [...orders]
        .sort(
            (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
        )
        .slice(0, 8);

    return (
        <div className="admin-dashboard">
            <header className="admin-dashboard__header">
                <div>
                    <p className="admin-dashboard__eyebrow">
                        RESTAURANT MANAGEMENT
                    </p>

                    <h1>Dashboard</h1>

                    <p>
                        Monitor orders and your restaurant's
                        daily operations.
                    </p>
                </div>

                <button
                    type="button"
                    className="admin-refresh-button"
                    disabled={isLoading}
                    onClick={() => void loadOrders()}
                >
                    {isLoading ? "Loading..." : "Refresh"}
                </button>
            </header>

            {error && (
                <div className="admin-error" role="alert">
                    {error}
                </div>
            )}

            <section
                className="admin-dashboard__stats"
                aria-label="Order statistics"
            >
                <article className="admin-dashboard__stat">
                    <span>Total orders</span>
                    <strong>
                        {isLoading ? "—" : orders.length}
                    </strong>
                    <small>All orders returned by the server</small>
                </article>

                <article className="admin-dashboard__stat">
                    <span>Awaiting preparation</span>
                    <strong>
                        {isLoading ? "—" : awaitingPreparation.length}
                    </strong>
                    <small>Pending or confirmed</small>
                </article>

                <article className="admin-dashboard__stat">
                    <span>Active orders</span>
                    <strong>
                        {isLoading ? "—" : activeOrders.length}
                    </strong>
                    <small>Being processed or delivered</small>
                </article>

                <article className="admin-dashboard__stat">
                    <span>Delivered</span>
                    <strong>
                        {isLoading ? "—" : deliveredOrders.length}
                    </strong>
                    <small>Successfully delivered</small>
                </article>
            </section>

            <section className="admin-dashboard__orders">
                <div className="admin-section-heading">
                    <div>
                        <h2>Recent orders</h2>
                        <p>
                            The latest orders recorded by the restaurant.
                        </p>
                    </div>

                    <span className="admin-order-count">
                        {isLoading ? "Loading" : `${orders.length} orders`}
                    </span>
                </div>

                {isLoading ? (
                    <div className="admin-dashboard__empty">
                        <p>Loading orders...</p>
                    </div>
                ) : error ? (
                    <div className="admin-dashboard__empty">
                        <p>Orders could not be loaded.</p>
                    </div>
                ) : recentOrders.length === 0 ? (
                    <div className="admin-dashboard__empty">
                        <h3>No orders yet</h3>
                        <p>
                            New orders will appear here once available.
                        </p>
                    </div>
                ) : (
                    <div className="admin-orders-table-wrapper">
                        <table className="admin-orders-table">
                            <thead>
                                <tr>
                                    <th>Order</th>
                                    <th>Placed</th>
                                    <th>Items</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {recentOrders.map((order) => (
                                    <tr key={order.id}>
                                        <td>
                                            <strong>
                                                #{order.id.slice(-8)}
                                            </strong>
                                        </td>

                                        <td>
                                            {formatDate(order.createdAt)}
                                        </td>

                                      <td>
    {order.items.reduce<number>(
  (total: number, item: OrderItem) => total + item.quantity,
  0,
)}
</td>

                                        <td>
                                            <strong>
                                                {formatCurrency(
                                                    order.totalInPaise,
                                                )}
                                            </strong>
                                        </td>

                                        <td>
                                            <span
                                                className={getStatusClass(
                                                    order.status,
                                                )}
                                            >
                                                {statusLabels[order.status]}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}
