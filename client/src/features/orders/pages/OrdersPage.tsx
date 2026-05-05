import { useMutation, useQuery } from "@apollo/client/react";
import toast from "react-hot-toast";

import { GET_MY_ORDERS } from "../graphql/order.queries";
import { CANCEL_ORDER } from "../graphql/order.mutations";
import type { OrdersResponse } from "../types/order.types";
import OrderTimeline from "../components/OrderTimeline";
import { reportError } from "../../../lib/errors";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
});

// ✅ FIXED DATE HANDLER
const formatOrderDate = (createdAt?: string) => {
  if (!createdAt) return "Unknown date";

  let parsedDate = new Date(createdAt);

  // Handle non-ISO format like "2026-04-14 10:20:30"
  if (isNaN(parsedDate.getTime()) && createdAt.includes(" ")) {
    parsedDate = new Date(createdAt.replace(" ", "T"));
  }

  // Still invalid → fallback safely
  if (isNaN(parsedDate.getTime())) {
    console.warn("Invalid date received:", createdAt);
    return "Unknown date";
  }

  return dateFormatter.format(parsedDate);
};

// ✅ STATUS COLOR HELPER
const getStatusStyle = (status: string) => {
  switch (status) {
    case "PAID":
      return "bg-green-100 text-green-700 dark:bg-emerald-900/30 dark:text-emerald-200";
    case "PENDING_PAYMENT":
      return "bg-yellow-100 text-yellow-700 dark:bg-amber-900/30 dark:text-amber-200";
    case "SHIPPED":
      return "bg-blue-100 text-blue-700 dark:bg-sky-900/30 dark:text-sky-200";
    case "DELIVERED":
      return "bg-purple-100 text-purple-700 dark:bg-violet-900/30 dark:text-violet-200";
    case "CANCELLED":
      return "bg-red-100 text-red-700 dark:bg-rose-900/30 dark:text-rose-200";
    default:
      return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
  }
};

const OrdersPage = () => {
  const { data, loading, error } = useQuery<OrdersResponse>(GET_MY_ORDERS, {
    fetchPolicy: "cache-and-network",
  });
  const [cancelOrder, { loading: isCancelling }] = useMutation(CANCEL_ORDER, {
    refetchQueries: [{ query: GET_MY_ORDERS }],
    awaitRefetchQueries: true,
  });

  const handleCancelOrder = async (orderId: string, status: string) => {
    const isPaid = status === "PAID";
    const confirmed = window.confirm(
      isPaid
        ? "Cancel this paid order and start the refund flow?"
        : "Cancel this order?"
    );

    if (!confirmed) return;

    const toastId = toast.loading(
      isPaid ? "Cancelling order and starting refund..." : "Cancelling order..."
    );

    try {
      await cancelOrder({
        variables: { orderId },
      });

      toast.success(
        isPaid
          ? "Order cancelled. Refund status will be sent by email and SMS."
          : "Order cancelled successfully.",
        { id: toastId }
      );
    } catch (cancelError) {
      toast.error(reportError(cancelError, "Could not cancel order"), {
        id: toastId,
      });
    }
  };

  if (loading) {
    return <p className="text-sm text-gray-500">Loading orders...</p>;
  }

  if (error) {
    return (
      <div className="rounded-[2rem] border border-red-200 bg-red-50 p-8 text-center text-red-700">
        <h1 className="text-xl font-semibold">Error loading orders</h1>
        <p className="mt-2 text-sm">
          We could not load your order history right now.
        </p>
      </div>
    );
  }

  const orders = data?.myOrders || [];

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <section className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,#f8fafc,#ffffff_45%,#eff6ff)] p-8 shadow-sm dark:border-slate-700 dark:bg-slate-950 dark:bg-[linear-gradient(135deg,#020617,#0b1220_45%,#111827)]">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          Order History
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-900 dark:text-white">
          Keep track of every purchase.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
          Review your latest orders, item breakdowns, totals, and fulfillment
          status.
        </p>
      </section>

      {/* EMPTY STATE */}
      {orders.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white/90 p-12 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">No orders yet</h2>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            Once you place an order, it will appear here with item and status
            details.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => {
            const canCancel = ["PENDING_PAYMENT", "PAID"].includes(order.status);

            return (
              <article
                key={order.id}
                className="rounded-[1.5rem] border border-slate-200 bg-white/95 p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/90"
              >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                      Order #{order.id.slice(0, 8)}
                    </h2>

                    {/* ✅ STATUS BADGE */}
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                        order.status,
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Placed on {formatOrderDate(order.createdAt)}
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:items-end">
                  <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Total</p>
                    <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                      {currencyFormatter.format(order.totalAmount)}
                    </p>
                  </div>

                  {canCancel && (
                    <button
                      type="button"
                      disabled={isCancelling}
                      onClick={() => handleCancelOrder(order.id, order.status)}
                      className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-200 dark:hover:bg-rose-900/30"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>

              {order.status === "PAID" && canCancel && (
                <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-900/15 dark:text-amber-200">
                  Paid orders are eligible for refund when cancelled. We will
                  notify you with the refund status after cancellation.
                </p>
              )}

              {/* ITEMS */}
              <div className="mt-5 grid gap-3">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950"
                  >
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{item.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Qty: {item.quantity}
                      </p>
                    </div>

                    <p className="font-semibold text-slate-900 dark:text-white">
                      {currencyFormatter.format(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
              {/* ✅ TIMELINE */}
              <OrderTimeline
                history={order.statusHistory || []}
                currentStatus={order.status}
              />
            </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
