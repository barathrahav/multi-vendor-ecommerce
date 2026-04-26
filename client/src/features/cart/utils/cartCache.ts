import type { ApolloCache } from "@apollo/client/cache";

import { GET_CART } from "../graphql/cart.queries";
import type { CartItem, CartResponse } from "../types/cart.types";

type ProductLike = CartItem["product"];

type CartMutationData = {
  addToCart?: CartResponse["cart"];
  updateCartItem?: CartResponse["cart"];
  removeFromCart?: CartResponse["cart"];
};

const emptyCart = (): CartResponse["cart"] => ({
  id: "local-cart",
  items: [],
});

const ensureCart = (cart?: CartResponse["cart"] | null) => cart ?? emptyCart();

export const getCartFromCache = (cache: ApolloCache) => {
  return cache.readQuery<CartResponse>({
    query: GET_CART,
  })?.cart;
};

export const writeCartToCache = (
  cache: ApolloCache,
  cart: CartResponse["cart"]
) => {
  cache.writeQuery<CartResponse>({
    query: GET_CART,
    data: { cart },
  });
};

export const buildCartItem = (
  product: ProductLike,
  quantity: number,
  fallbackId = `temp-${product.id}`
): CartItem => ({
  id: fallbackId,
  quantity,
  product: {
    id: product.id,
    name: product.name,
    price: product.price,
    imageUrl: product.imageUrl ?? null,
  },
});

export const buildOptimisticCartForAdd = (
  cart: CartResponse["cart"] | undefined,
  product: ProductLike,
  quantity: number
) => {
  const currentCart = ensureCart(cart);
  const existingItem = currentCart.items.find(
    (item) => item.product.id === product.id
  );

  if (existingItem) {
    return {
      ...currentCart,
      items: currentCart.items.map((item) =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ),
    };
  }

  return {
    ...currentCart,
    items: [...currentCart.items, buildCartItem(product, quantity)],
  };
};

export const buildOptimisticCartForQuantity = (
  cart: CartResponse["cart"] | undefined,
  productId: string,
  quantity: number
) => {
  const currentCart = ensureCart(cart);

  return {
    ...currentCart,
    items: currentCart.items
      .map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
      .filter((item) => item.quantity > 0),
  };
};

export const buildOptimisticCartForRemove = (
  cart: CartResponse["cart"] | undefined,
  productId: string
) => {
  const currentCart = ensureCart(cart);

  return {
    ...currentCart,
    items: currentCart.items.filter((item) => item.product.id !== productId),
  };
};

export const buildOptimisticCartForClear = (
  cart: CartResponse["cart"] | undefined
) => ({
  ...ensureCart(cart),
  items: [],
});

export const toOptimisticCartPayload = (cart: CartResponse["cart"]) => ({
  __typename: "Cart" as const,
  id: cart.id,
  items: cart.items.map((item) => ({
    __typename: "CartItem" as const,
    id: item.id,
    quantity: item.quantity,
    product: {
      __typename: "Product" as const,
      id: item.product.id,
      name: item.product.name,
      price: item.product.price,
      imageUrl: item.product.imageUrl,
    },
  })),
});

export const syncCartMutation =
  (fieldName: keyof CartMutationData) =>
  (cache: ApolloCache, result: { data?: unknown }) => {
    const nextCart = (result.data as CartMutationData | undefined)?.[fieldName];

    if (nextCart) {
      writeCartToCache(cache, nextCart);
    }
  };
