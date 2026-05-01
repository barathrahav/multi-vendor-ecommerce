import { useQuery } from "@apollo/client/react";

import ProductCard from "../../products/components/ProductCard";
import { GET_MY_WISHLIST } from "../graphql/wishlist.queries";
import type { Product } from "../../products/types/product.types";

type WishlistItem = {
  id: string;
  product: Product;
};

const WishlistPage = () => {
  const { data, loading, error } = useQuery<{ myWishlist: WishlistItem[] }>(
    GET_MY_WISHLIST,
    {
      fetchPolicy: "cache-and-network",
    }
  );

  const items = data?.myWishlist ?? [];
  const wishedIds = items.map((item) => item.product.id);

  if (loading) {
    return <p className="text-sm text-gray-500">Loading wishlist...</p>;
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        We could not load your wishlist right now.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
          Wishlist
        </p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">Saved products</h1>
        <p className="mt-2 text-sm text-gray-600">
          Keep products handy and move them to cart whenever you are ready.
        </p>
      </section>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-gray-50 p-10 text-center">
          <h2 className="text-lg font-semibold text-gray-900">
            Your wishlist is empty
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Tap the heart on products to save them here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <ProductCard
              key={item.id}
              product={item.product}
              wishedProductIds={wishedIds}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
