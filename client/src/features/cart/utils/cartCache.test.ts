import { describe, expect, it } from "vitest";

import {
  buildCartItem,
  buildOptimisticCartForAdd,
  buildOptimisticCartForClear,
  buildOptimisticCartForQuantity,
  buildOptimisticCartForRemove,
} from "./cartCache";

const product = {
  id: "product-1",
  name: "Cotton T-shirt",
  price: 499,
  imageUrl: "https://example.com/tshirt.png",
};

const cart = {
  id: "cart-1",
  items: [buildCartItem(product, 2, "item-1")],
};

describe("cart cache optimistic builders", () => {
  it("builds a cart item from product details", () => {
    expect(buildCartItem(product, 3, "item-2")).toEqual({
      id: "item-2",
      quantity: 3,
      product,
    });
  });

  it("adds quantity to an existing cart item", () => {
    expect(buildOptimisticCartForAdd(cart, product, 2).items).toEqual([
      {
        ...cart.items[0],
        quantity: 4,
      },
    ]);
  });

  it("creates a local cart when adding to an empty cache", () => {
    expect(buildOptimisticCartForAdd(undefined, product, 1)).toEqual({
      id: "local-cart",
      items: [buildCartItem(product, 1)],
    });
  });

  it("removes items whose updated quantity is zero", () => {
    expect(buildOptimisticCartForQuantity(cart, product.id, 0).items).toEqual([]);
  });

  it("removes an item by product id", () => {
    expect(buildOptimisticCartForRemove(cart, product.id).items).toEqual([]);
  });

  it("clears all cart items", () => {
    expect(buildOptimisticCartForClear(cart)).toEqual({
      ...cart,
      items: [],
    });
  });
});
