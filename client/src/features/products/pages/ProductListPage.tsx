import { useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../auth/hooks/useAuth";

import ProductCard from "../components/ProductCard";
import ProductCardSkeleton from "../components/ProductCardSkeleton";
import { GET_CATEGORIES, GET_PRODUCTS } from "../graphql/product.queries";
import { GET_MY_WISHLIST } from "../../wishlist/graphql/wishlist.queries";
import type {
  CategoriesResponse,
  ProductsResponse,
  ProductsVariables,
  WishlistResponse,
} from "../types/product.types";
import { getErrorMessage } from "../../../lib/errors";

const sortOptions = [
  { label: "Newest First", value: "createdAt-desc", sortBy: "createdAt", sortOrder: "desc" },
  { label: "Price: Low to High", value: "price-asc", sortBy: "price", sortOrder: "asc" },
  { label: "Price: High to Low", value: "price-desc", sortBy: "price", sortOrder: "desc" },
];

const ProductListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { role } = useAuth();

  const selectedSort =
    sortOptions.find((o) => o.value === searchParams.get("sort")) ?? sortOptions[0];

  const page = Math.max(Number(searchParams.get("page") ?? "1"), 1);
  const categoryId = searchParams.get("category") ?? undefined;

  const { data, loading, error } = useQuery<
    ProductsResponse,
    ProductsVariables
  >(GET_PRODUCTS, {
    variables: {
      page,
      limit: 8,
      categoryId,
      sortBy: selectedSort.sortBy,
      sortOrder: selectedSort.sortOrder,
    },
  });

  const { data: categoriesData } = useQuery<CategoriesResponse>(GET_CATEGORIES);

  const { data: wishlistData } = useQuery<WishlistResponse>(GET_MY_WISHLIST, {
    skip: role !== "CUSTOMER",
  });

  const products = data?.products.items ?? [];
  const wishedProductIds =
    wishlistData?.myWishlist.map((item) => item.product.id) ?? [];

  const totalPages = data?.products.totalPages ?? 1;

  const visiblePages = useMemo(() => {
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, page + 2);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [page, totalPages]);

  const updateParams = (key: string, value?: string) => {
    const next = new URLSearchParams(searchParams);
    if (!value) next.delete(key);
    else next.set(key, value);
    next.set("page", "1");
    setSearchParams(next);
  };

  const updatePage = (p: number) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(p));
    setSearchParams(next);
  };

  if (error) {
    return (
      <div className="rounded-xl p-6 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300">
        {getErrorMessage(error)}
      </div>
    );
  }

  return (
    <div className="relative space-y-8 p-3 rounded-[2rem]
      text-gray-900 dark:text-white
      bg-gradient-to-br from-orange-50 via-white to-blue-50
      dark:from-gray-900 dark:via-black dark:to-gray-900">

      {/* BACKGROUND GLOW */}
      <div className="absolute inset-0 -z-10 blur-3xl opacity-30
        bg-gradient-to-tr from-orange-200 via-blue-200 to-purple-200
        dark:from-blue-900 dark:via-purple-900 dark:to-black" />

      {/* HERO (UNCHANGED CONTENT — ONLY STYLE UPDATED) */}
      <section className="rounded-[2rem] border p-6 shadow-lg
        backdrop-blur bg-white/70 dark:bg-white/5
        bg-gradient-to-br from-white/80 to-white/40
        dark:from-white/5 dark:to-transparent">

        <div className="space-y-4">
            <p className="text-sm uppercase tracking-widest text-gray-500 dark:text-gray-400">
              Marketplace
            </p>
            <h1 className="text-4xl md:text-5xl font-black">
              Discover products with smarter filters.
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Search, filter and explore products effortlessly.
            </p>
          </div>

      </section>

      {/* FILTERS */}
      <section className="rounded-[2rem] border p-6 shadow-sm
        backdrop-blur bg-white/70 dark:bg-white/5
        bg-gradient-to-br from-white/80 to-white/40
        dark:from-white/5 dark:to-transparent">

        <div className="grid md:grid-cols-3 gap-4">

          <select
            value={categoryId ?? ""}
            onChange={(e) => updateParams("category", e.target.value)}
            className="input"
          >
            <option value="">All Categories</option>
            {categoriesData?.categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={selectedSort.value}
            onChange={(e) => updateParams("sort", e.target.value)}
            className="input"
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          <button
            onClick={() => setSearchParams({})}
            className="btn-secondary"
          >
            Reset Filters
          </button>

        </div>
      </section>

      {/* PRODUCTS */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              wishedProductIds={wishedProductIds}
            />
          ))}
        </div>
      )}

      {/* PAGINATION */}
      <div className="flex justify-center gap-2">
        {visiblePages.map((p) => (
          <button
            key={p}
            onClick={() => updatePage(p)}
            className={`px-4 py-2 rounded-xl border transition
              ${
                p === page
                  ? "bg-gradient-to-r from-black to-gray-800 dark:from-white dark:to-gray-300 text-white dark:text-black"
                  : "bg-white/80 dark:bg-white/5 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
          >
            {p}
          </button>
        ))}
      </div>

    </div>
  );
};

export default ProductListPage;
