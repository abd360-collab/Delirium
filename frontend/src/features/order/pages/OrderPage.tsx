
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getOrders } from "../../../api/order.api";
import { socket } from "../../../lib/realtime/socket";
import type { Order } from "../../../types/order.types";
import type { OrderStatusChangedEvent } from "../../../types/realtime.types";
import { OrderCard } from "../components/OrderCard";

interface JoinOrderResponse {
    success: boolean;
    message?: string;
}

export function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        let realtimeStarted = false;

        function handleStatusChanged(
            event: OrderStatusChangedEvent,
        ) {
            if (!isMounted) return;

            setOrders((currentOrders) =>
                currentOrders.map((order) =>
                    order.id === event.orderId
                        ? { ...order, status: event.newStatus }
                        : order,
                ),
            );
        }

        function joinOrderRooms(loadedOrders: Order[]) {
            for (const order of loadedOrders) {
                socket.emit(
                    "order:join",
                    { orderId: order.id },
                    (response: JoinOrderResponse) => {
                        if (!response.success) {
                            console.error(
                                `Failed to join order ${order.id}:`,
                                response.message,
                            );
                        }
                    },
                );
            }
        }

        function handleConnect() {
            if (!isMounted || !realtimeStarted) return;
            joinOrderRooms(ordersSnapshot);
        }

        // Keep the exact orders fetched during this page load.
        let ordersSnapshot: Order[] = [];

        async function loadOrders() {
            try {
                const data = await getOrders();

                if (!isMounted) return;

                ordersSnapshot = data;
                setOrders(data);

                if (data.length > 0) {
                    realtimeStarted = true;

                    socket.on(
                        "order:status_changed",
                        handleStatusChanged,
                    );
                    socket.on("connect", handleConnect);

                    if (socket.connected) {
                        joinOrderRooms(data);
                    } else {
                        socket.connect();
                    }
                }
            } catch (loadError) {
                console.error("Failed to load orders:", loadError);

                if (isMounted) {
                    setError("Unable to load your orders.");
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        void loadOrders();

        return () => {
            isMounted = false;
            realtimeStarted = false;

            socket.off(
                "order:status_changed",
                handleStatusChanged,
            );
            socket.off("connect", handleConnect);

            socket.disconnect();
        };
    }, []);

    if (isLoading) {
        return (
            <section className="orders-page">
                <p>Loading your orders...</p>
            </section>
        );
    }

    if (error) {
        return (
            <section className="orders-page">
                <p>{error}</p>
            </section>
        );
    }

    if (orders.length === 0) {
        return (
            <section className="orders-page">
                <h1 className="orders-page__title">
                    Your Orders
                </h1>

                <p className="orders-page__subtitle">
                    Track your recent orders and their current status.
                </p>

                <div className="orders-page__empty">
                    <p>You haven't placed any orders yet.</p>

                    <Link
                        to="/menu"
                        className="orders-page__empty-link"
                    >
                        Explore the Menu
                    </Link>
                </div>
            </section>
        );
    }

    return (
        <section className="orders-page">
            <h1 className="orders-page__title">
                Your Orders
            </h1>

            <p className="orders-page__subtitle">
                Track your recent orders and their current status.
            </p>

            <div className="orders-page__list">
                {orders.map((order) => (
                    <OrderCard
                        key={order.id}
                        order={order}
                    />
                ))}
            </div>
        </section>
    );
}
