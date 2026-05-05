import { useApolloClient, useMutation, useQuery } from "@apollo/client/react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import CartPageSkeleton from "../components/CartPageSkeleton";
import { CLEAR_CART, REMOVE_CART, UPDATE_CART } from "../graphql/cart.mutations";
import { GET_CART } from "../graphql/cart.queries";
import type { CartItem, CartResponse } from "../types/cart.types";
import {
  buildOptimisticCartForClear,
  buildOptimisticCartForQuantity,
  buildOptimisticCartForRemove,
  getCartFromCache,
  syncCartMutation,
  toOptimisticCartPayload,
  writeCartToCache,
} from "../utils/cartCache";
import { getErrorMessage, reportError } from "../../../lib/errors";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const CartPage = () => {
  const apolloClient = useApolloClient();
  const { data, loading, error, refetch } = useQuery<CartResponse>(GET_CART, {
    fetchPolicy: "cache-and-network",
  });

  const [updateCart] = useMutation(UPDATE_CART, {
    update: syncCartMutation("updateCartItem"),
  });
  const [removeCart] = useMutation(REMOVE_CART, {
    update: syncCartMutation("removeFromCart"),
  });
  const [clearCart] = useMutation(CLEAR_CART);
  const navigate = useNavigate();

  if (loading) return <CartPageSkeleton />;

  const items = data?.cart?.items || [];

  if (error && !data?.cart) {
    return (
      <div className="rounded-[2rem] border border-red-200 bg-red-50 p-8 text-center text-red-700">
        <h1 className="text-xl font-semibold">Error loading cart</h1>
        <p className="mt-2 text-sm">
          {getErrorMessage(
            error,
            "We could not load your cart right now. Please try again in a moment."
          )}
        </p>
      </div>
    );
  }

  const total = items.reduce(
    (sum: number, item: CartItem) => sum + item.product.price * item.quantity,
    0
  );

  const handleUpdate = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await handleRemove(productId);
      return;
    }

    const toastId = toast.loading("Updating cart...");

    try {
      const currentCart = getCartFromCache(apolloClient.cache);
      const optimisticCart = buildOptimisticCartForQuantity(
        currentCart,
        productId,
        quantity
      );

      await updateCart({
        variables: { productId, quantity },
        optimisticResponse: {
          updateCartItem: toOptimisticCartPayload(optimisticCart),
        },
      });
      toast.success("Cart updated", { id: toastId });
    } catch (mutationError) {
      await refetch();
      toast.error(reportError(mutationError, "Could not update cart"), {
        id: toastId,
      });
    }
  };

  const handleRemove = async (productId: string) => {
    const toastId = toast.loading("Removing item...");

    try {
      const currentCart = getCartFromCache(apolloClient.cache);
      const optimisticCart = buildOptimisticCartForRemove(currentCart, productId);

      await removeCart({
        variables: { productId },
        optimisticResponse: {
          removeFromCart: toOptimisticCartPayload(optimisticCart),
        },
      });
      toast.success("Item removed", { id: toastId });
    } catch (mutationError) {
      await refetch();
      toast.error(reportError(mutationError, "Could not remove item"), {
        id: toastId,
      });
    }
  };

  const handleClear = async () => {
    const toastId = toast.loading("Clearing cart...");
    const previousCart = getCartFromCache(apolloClient.cache);

    try {
      writeCartToCache(
        apolloClient.cache,
        buildOptimisticCartForClear(previousCart)
      );
      await clearCart();
      toast.success("Cart cleared", { id: toastId });
    } catch (mutationError) {
      const errorMessage = getErrorMessage(
        mutationError,
        "Could not clear cart"
      );

      if (/unauthor/i.test(errorMessage)) {
        if (previousCart) {
          writeCartToCache(apolloClient.cache, previousCart);
        }
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        await apolloClient.clearStore();
        toast.error("Session expired. Please log in again.", { id: toastId });
        navigate("/login");
        return;
      }

      if (previousCart) {
        writeCartToCache(apolloClient.cache, previousCart);
      }
      await refetch();
      toast.error(reportError(mutationError, "Could not clear cart"), {
        id: toastId,
      });
    }
  };

  if (items.length === 0) {
    return (
      <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900/90">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Your cart is empty</h1>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          Add a few products and come back here to review your order.
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-6 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-200/10 transition duration-200 hover:bg-slate-900 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,#f8fafc,#ffffff_45%,#fff7ed)] p-8 shadow-sm dark:border-slate-700 dark:bg-slate-950 dark:bg-[linear-gradient(135deg,#020617,#0b1220_45%,#111827)]">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          Shopping Cart
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-900 dark:text-white">
          Review your items before checkout.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
          Update quantities, remove products, and confirm your order summary in
          one place.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <section className="space-y-4">
          {items.map((item) => (
            <article
              key={item.id}
              className="flex flex-col gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/95 md:flex-row md:items-center md:justify-between"
            >
              <div className="flex items-center gap-4">
                <img
                  src={
                    item.product.imageUrl ||
                    "https://via.placeholder.com/300x220?text=Product"
                  }
                  alt={item.product.name}
                  className="h-24 w-24 rounded-2xl object-cover"
                />

                <div className="space-y-2">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {item.product.name}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {currencyFormatter.format(item.product.price)} each
                  </p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {currencyFormatter.format(item.product.price * item.quantity)}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-1 dark:border-slate-700 dark:bg-slate-950">
                  <button
                    onClick={() => void handleUpdate(item.product.id, item.quantity - 1)}
                    className="rounded-full px-3 py-1 text-sm font-semibold text-slate-700 transition hover:bg-white dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    -
                  </button>
                  <span className="min-w-10 text-center text-sm font-semibold text-slate-900 dark:text-white">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => void handleUpdate(item.product.id, item.quantity + 1)}
                    className="rounded-full px-3 py-1 text-sm font-semibold text-slate-700 transition hover:bg-white dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => void handleRemove(item.product.id)}
                  className="rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-rose-800 dark:text-rose-200 dark:hover:bg-rose-900/20"
                >
                  Remove
                </button>
              </div>
            </article>
          ))}
        </section>

        <aside className="h-fit rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/95">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Order Summary</h2>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
              <span>Items</span>
              <span>{items.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
              <span>Total Quantity</span>
              <span>
                {items.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            </div>
            <div className="flex items-center justify-between border-t pt-4 text-base font-semibold text-slate-900 dark:text-white">
              <span>Total</span>
              <span>{currencyFormatter.format(total)}</span>
            </div>
          </div>

          <button
            onClick={() => navigate("/checkout")}
            className="mt-6 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-slate-200/10 transition duration-200 hover:bg-slate-900 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
          >
            Proceed to Checkout
          </button>

          <button
            onClick={() => void handleClear()}
            className="mt-3 w-full rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-600 transition hover:bg-red-100 dark:border-rose-800 dark:bg-rose-900/15 dark:text-rose-200 dark:hover:bg-rose-900/25"
          >
            Clear Cart
          </button>
        </aside>
      </div>
    </div>
  );
};

export default CartPage;
