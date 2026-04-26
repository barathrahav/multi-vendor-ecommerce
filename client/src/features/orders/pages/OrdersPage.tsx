import { useQuery } from "@apollo/client/react";

import { GET_MY_ORDERS } from "../graphql/order.queries";
import type { OrdersResponse } from "../types/order.types";

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
      return "bg-green-100 text-green-700";
    case "PENDING_PAYMENT":
      return "bg-yellow-100 text-yellow-700";
    case "SHIPPED":
      return "bg-blue-100 text-blue-700";
    case "DELIVERED":
      return "bg-purple-100 text-purple-700";
    case "CANCELLED":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const OrdersPage = () => {
  const { data, loading, error } = useQuery<OrdersResponse>(GET_MY_ORDERS, {
    fetchPolicy: "cache-and-network",
  });

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
      <section className="rounded-[2rem] border bg-[linear-gradient(135deg,#eff6ff,#ffffff_45%,#ecfeff)] p-8 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-gray-500">
          Order History
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-gray-900">
          Keep track of every purchase.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-600">
          Review your latest orders, item breakdowns, totals, and fulfillment status.
        </p>
      </section>

      {/* EMPTY STATE */}
      {orders.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed bg-white p-12 text-center shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900">No orders yet</h2>
          <p className="mt-3 text-sm text-gray-500">
            Once you place an order, it will appear here with item and status details.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => (
            <article
              key={order.id}
              className="rounded-[1.5rem] border bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Order #{order.id.slice(0, 8)}
                    </h2>

                    {/* ✅ STATUS BADGE */}
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <p className="text-sm text-gray-500">
                    Placed on {formatOrderDate(order.createdAt)}
                  </p>
                </div>

                {/* TOTAL */}
                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="mt-1 text-xl font-bold text-gray-900">
                    {currencyFormatter.format(order.totalAmount)}
                  </p>
                </div>
              </div>

              {/* ITEMS */}
              <div className="mt-5 grid gap-3">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl border bg-gray-50 px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {item.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity}
                      </p>
                    </div>

                    <p className="font-semibold text-gray-900">
                      {currencyFormatter.format(
                        item.price * item.quantity
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;