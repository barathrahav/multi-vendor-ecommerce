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

  if (error) {
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

  const items = data?.cart?.items || [];

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
      <div className="rounded-[2rem] border border-dashed bg-white p-12 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Your cart is empty</h1>
        <p className="mt-3 text-sm text-gray-500">
          Add a few products and come back here to review your order.
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-6 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border bg-[linear-gradient(135deg,#f8fafc,#ffffff_45%,#fff7ed)] p-8 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-gray-500">
          Shopping Cart
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-gray-900">
          Review your items before checkout.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-600">
          Update quantities, remove products, and confirm your order summary in
          one place.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <section className="space-y-4">
          {items.map((item) => (
            <article
              key={item.id}
              className="flex flex-col gap-4 rounded-[1.5rem] border bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between"
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
                  <h2 className="text-lg font-semibold text-gray-900">
                    {item.product.name}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {currencyFormatter.format(item.product.price)} each
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {currencyFormatter.format(item.product.price * item.quantity)}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center rounded-full border bg-gray-50 px-2 py-1">
                  <button
                    onClick={() => void handleUpdate(item.product.id, item.quantity - 1)}
                    className="rounded-full px-3 py-1 text-sm font-semibold text-gray-700 transition hover:bg-white"
                  >
                    -
                  </button>
                  <span className="min-w-10 text-center text-sm font-semibold text-gray-900">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => void handleUpdate(item.product.id, item.quantity + 1)}
                    className="rounded-full px-3 py-1 text-sm font-semibold text-gray-700 transition hover:bg-white"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => void handleRemove(item.product.id)}
                  className="rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                >
                  Remove
                </button>
              </div>
            </article>
          ))}
        </section>

        <aside className="h-fit rounded-[1.5rem] border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Items</span>
              <span>{items.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Total Quantity</span>
              <span>
                {items.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            </div>
            <div className="flex items-center justify-between border-t pt-4 text-base font-semibold text-gray-900">
              <span>Total</span>
              <span>{currencyFormatter.format(total)}</span>
            </div>
          </div>

          <button
            onClick={() => navigate("/checkout")}
            className="mt-6 w-full rounded-2xl bg-black px-5 py-4 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            Proceed to Checkout
          </button>

          <button
            onClick={() => void handleClear()}
            className="mt-3 w-full rounded-2xl border border-red-200 px-5 py-4 text-sm font-semibold text-red-600 transition hover:bg-red-50"
          >
            Clear Cart
          </button>
        </aside>
      </div>
    </div>
  );
};

export default CartPage;
