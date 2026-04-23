import { useMutation, useQuery } from "@apollo/client/react";
import toast from "react-hot-toast";

import { useAuth } from "../../auth/hooks/useAuth";
import {
  GET_VENDOR_ORDERS,
} from "../../orders/graphql/order.queries";
import {
  VENDOR_UPDATE_ORDER_STATUS,
} from "../../orders/graphql/order.mutations";
import type {
  OrderItem,
  VendorOrdersResponse,
} from "../../orders/types/order.types";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
});

const vendorStatuses = [
  "PENDING_PAYMENT",
  "PAID",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const VendorOrdersPage = () => {
  const { user, loading: authLoading } = useAuth();
  const vendorId = user?.id;
  const { data, loading, error } =
    useQuery<VendorOrdersResponse>(GET_VENDOR_ORDERS, {
      skip: !vendorId,
      fetchPolicy: "network-only",
      nextFetchPolicy: "cache-first",
    });

  const [updateOrderStatus, { loading: isUpdating }] = useMutation(
    VENDOR_UPDATE_ORDER_STATUS,
    {
      refetchQueries: [{ query: GET_VENDOR_ORDERS }],
      awaitRefetchQueries: true,
      onCompleted: () => {
        toast.success("Order status updated");
      },
      onError: (mutationError) => {
        toast.error(mutationError.message || "Could not update order");
      },
    }
  );

  const orders = data?.vendorOrders ?? [];
  const vendorItemsForOrder = (items: OrderItem[]) =>
    items.filter((item) => item.product?.vendor?.id === vendorId);
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

  if (authLoading || loading) {
    return <p className="text-sm text-gray-500">Loading vendor orders...</p>;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
        We could not load vendor orders right now.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
          Vendor Dashboard
        </p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">
          Order Management
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-gray-600">
          Review orders that include your products and update their fulfillment
          status.
        </p>
      </section>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-gray-50 p-10 text-center">
          <h2 className="text-lg font-semibold text-gray-900">
            No orders for your products yet
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Once customers place orders containing your catalog items, they will
            appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => {
            const vendorItems = vendorItemsForOrder(order.items ?? []);
            const vendorOrderTotal = vendorItems.reduce(
              (sum, item) => sum + item.price * item.quantity,
              0
            );

            return (
              <article
                key={order.id}
                className="rounded-2xl border bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-lg font-semibold text-gray-900">
                        Order #{order.id?.slice(0, 8) ?? "Unknown"}
                      </h2>
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Placed on {formatOrderDate(order.createdAt)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Customer: {order.user?.name ?? "Unknown customer"}
                      {order.user?.email ? ` (${order.user.email})` : ""}
                    </p>
                  </div>

                  <div className="w-full max-w-xs space-y-3 rounded-2xl bg-gray-50 p-4">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Your items total</span>
                      <span className="font-semibold text-gray-900">
                        {currencyFormatter.format(vendorOrderTotal)}
                      </span>
                    </div>

                    <label className="block text-sm font-medium text-gray-700">
                      Update status
                    </label>
                    <select
                      value={order.status}
                      disabled={isUpdating}
                      onChange={(e) =>
                        updateOrderStatus({
                          variables: {
                            orderId: order.id,
                            status: e.target.value,
                          },
                        })
                      }
                      className="w-full rounded-lg border bg-white px-3 py-2 outline-none transition focus:border-black"
                    >
                      {vendorStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-5 grid gap-3">
                  {vendorItems.length === 0 ? (
                    <div className="rounded-xl border border-dashed bg-gray-50 px-4 py-3 text-sm text-gray-500">
                      No vendor-specific items found for this order.
                    </div>
                  ) : (
                    vendorItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-xl border bg-gray-50 px-4 py-3"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-500">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="font-semibold text-gray-900">
                          {currencyFormatter.format(item.price * item.quantity)}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VendorOrdersPage;
