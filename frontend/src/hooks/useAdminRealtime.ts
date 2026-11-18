
import { useEffect, useRef } from "react";
import { useAuth } from "./useAuth";
import { socket } from "../lib/realtime/socket";
import type { OrderStatusChangedEvent } from "../types/realtime.types";
import type { Order } from "../types/order.types";

interface UseAdminRealtimeOptions {
  onNewOrder?: (order: Order) => void;
  onOrderStatusChanged?: (event: OrderStatusChangedEvent) => void;
}

export function useAdminRealtime({
  onNewOrder,
  onOrderStatusChanged,
}: UseAdminRealtimeOptions = {}): void {
  const { user, isLoading } = useAuth();

  const onNewOrderRef = useRef(onNewOrder);
  const onOrderStatusChangedRef = useRef(onOrderStatusChanged);


  useEffect(() => {
    onNewOrderRef.current = onNewOrder;
    onOrderStatusChangedRef.current = onOrderStatusChanged;
  }, [onNewOrder, onOrderStatusChanged]);


  useEffect(() => {
    if (isLoading || user?.role !== "ADMIN") {
      socket.disconnect();
      return;
    }

    function handleNewOrder(order: Order) {
      onNewOrderRef.current?.(order);
    }

    function handleStatusChanged(event: OrderStatusChangedEvent) {
        console.log("REALTIME STATUS EVENT RECEIVED:", event);
      onOrderStatusChangedRef.current?.(event);
    }

    socket.on("order:new", handleNewOrder);
    socket.on("order:status_changed", handleStatusChanged);
    socket.connect();

    return () => {
      socket.off("order:new", handleNewOrder);
      socket.off("order:status_changed", handleStatusChanged);
      socket.disconnect();
    };
  }, [isLoading, user?.role]);
}
