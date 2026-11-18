
import { useCallback, useEffect, useRef, useState } from "react";
import { getAdminOrders } from "../../../api/order.api";
import type { Order, OrderItem } from "../../../types/order.types";
import { useAdminRealtime } from "../../../hooks/useAdminRealtime";

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

export function AdminInvoicesPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const latestRequestId = useRef(0);

    const loadOrders = useCallback(async () => {
        const requestId = ++latestRequestId.current;

        try {
            const data = await getAdminOrders();

            if (requestId !== latestRequestId.current) {
                return;
            }

            setOrders(data);
            setError("");
        } catch {
            if (requestId !== latestRequestId.current) {
                return;
            }

            setError("Could not load invoices. Please try again.");
        } finally {
            if (requestId === latestRequestId.current) {
                setIsLoading(false);
            }
        }
    }, []);

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

    const currentSelectedOrder = selectedOrder
    ? orders.find((order) => order.id === selectedOrder.id) ?? selectedOrder
    : null;

  

    function printInvoice(order: Order) {
        setSelectedOrder(order);
    }

    return (
        <section className="admin-dashboard">
            <div className="admin-dashboard__header">
                <div>
                    <p className="admin-dashboard__eyebrow">
                        RESTAURANT MANAGEMENT
                    </p>
                    <h1>Invoices</h1>
                    <p>Review order records and customer details.</p>
                </div>
            </div>

            {error && <p className="admin-error" role="alert">{error}</p>}

            {isLoading ? (
                <p>Loading invoices...</p>
            ) : orders.length === 0 ? (
                <div className="admin-dashboard__empty">
                    <h3>No invoices available</h3>
                    <p>Invoices will appear when orders are placed.</p>
                </div>
            ) : (
                <div className="admin-orders-table-wrapper">
                    <table className="admin-orders-table">
                        <thead>
                            <tr>
                                <th>Order</th>
                                <th>Date</th>
                                <th>Customer phone</th>
                                <th>Status</th>
                                <th>Total</th>
                                <th>Invoice</th>
                            </tr>
                        </thead>

                        <tbody>
                            {orders.map((order) => (
                                <tr key={order.id}>
                                    <td>#{order.id.slice(-8)}</td>
                                    <td>{formatDate(order.createdAt)}</td>
                                    <td>{order.phoneNumber}</td>
                                    <td>{order.status.replaceAll("_", " ")}</td>
                                    <td>{formatCurrency(order.totalInPaise)}</td>
                                    <td>
                                        <button
                                            type="button"
                                            className="admin-refresh-button"
                                            onClick={() => printInvoice(order)}
                                        >
                                            View invoice
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {currentSelectedOrder  && (
                <div className="admin-invoice-preview">
                    <div className="admin-invoice-preview__header">
                        <div>
                            <p className="admin-dashboard__eyebrow">
                                ORDER INVOICE
                            </p>
                            <h2>Order #{currentSelectedOrder .id.slice(-8)}</h2>
                        </div>

                        <button
                            type="button"
                            className="admin-refresh-button"
                            onClick={() => window.print()}
                        >
                            Print invoice
                        </button>
                    </div>

                    <p>
                        <strong>Order date:</strong>{" "}
                        {formatDate(currentSelectedOrder .createdAt)}
                    </p>
                    <p>
                        <strong>Customer phone:</strong>{" "}
                        {currentSelectedOrder .phoneNumber}
                    </p>
                    <p>
                        <strong>Delivery address:</strong>{" "}
                        {currentSelectedOrder .deliveryAddress}
                    </p>
                    <p>
                        <strong>Status:</strong>{" "}
                        {currentSelectedOrder .status.replaceAll("_", " ")}
                    </p>

                    <div className="admin-orders-table-wrapper">
                        <table className="admin-orders-table">
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Quantity</th>
                                    <th>Unit price</th>
                                    <th>Line total</th>
                                </tr>
                            </thead>

                            <tbody>
                                {currentSelectedOrder .items.map((item: OrderItem) => (
                                    <tr key={item.id}>
                                        <td>{item.name}</td>
                                        <td>{item.quantity}</td>
                                        <td>
                                            {formatCurrency(item.unitPriceInPaise)}
                                        </td>
                                        <td>
                                            {formatCurrency(
                                                item.unitPriceInPaise * item.quantity,
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <h3>
                        Total: {formatCurrency(currentSelectedOrder .totalInPaise)}
                    </h3>
                </div>
            )}
        </section>
    );
}
