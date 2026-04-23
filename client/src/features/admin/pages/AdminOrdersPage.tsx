import { useQuery } from "@apollo/client/react";

import { GET_ALL_ORDERS } from "../graphql/admin.order";
import type { OrdersResponse } from "../../orders/types/order.types";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
});

type AdminOrdersResponse = {
  allOrders: OrdersResponse["myOrders"];
};

const AdminOrdersPage = () => {
  const { data, loading, error } = useQuery<AdminOrdersResponse>(GET_ALL_ORDERS, {
    fetchPolicy: "cache-and-network",
  });

  const orders = data?.allOrders ?? [];
  const formatOrderDate = (createdAt?: string) => {
    if (!createdAt) {
      return "Unknown date";
    }

    const parsedDate = new Date(createdAt);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Unknown date";
    }

    return dateFormatter.format(parsedDate);
  };

  if (loading) {
    return <p className="text-sm text-gray-500">Loading orders...</p>;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
        We could not load orders right now.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
          Admin Dashboard
        </p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">Orders</h1>
        <p className="mt-2 text-sm text-gray-600">
          Review every order in the system and see which user placed it.
        </p>
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">All Orders</h2>
          <span className="text-sm text-gray-500">
            {orders.length} order{orders.length === 1 ? "" : "s"}
          </span>
        </div>

        {orders.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed bg-gray-50 p-8 text-center text-sm text-gray-500">
            No orders found.
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {orders.map((order) => (
              <article key={order.id} className="rounded-xl border p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Order #{order.id?.slice(0, 8) ?? "Unknown"}
                      </h3>
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Placed on {formatOrderDate(order.createdAt)}
                    </p>
                    <p className="text-sm text-gray-700">
                      User ID: <span className="font-medium">{order.user?.id ?? "Unknown"}</span>
                    </p>
                    <p className="text-sm text-gray-700">
                      Customer: {order.user?.name ?? "Unknown customer"}
                      {order.user?.email ? ` (${order.user.email})` : ""}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">Order Total</p>
                    <p className="mt-1 text-xl font-bold text-gray-900">
                      {currencyFormatter.format(order.totalAmount)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3">
                  {(order.items ?? []).map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col gap-2 rounded-xl border bg-gray-50 px-4 py-3 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500">
                          Qty: {item.quantity} • Unit Price:{" "}
                          {currencyFormatter.format(item.price)}
                        </p>
                      </div>
                      <div className="text-sm text-gray-600 md:text-right">
                        <p>
                          Vendor: {item.product?.vendor?.name ?? "Unknown"}
                        </p>
                        <p>Vendor ID: {item.product?.vendor?.id ?? "Unknown"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminOrdersPage;
