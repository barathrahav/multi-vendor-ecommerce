import { useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import { useSearchParams } from "react-router-dom";

import ProductCard from "../components/ProductCard";
import ProductCardSkeleton from "../components/ProductCardSkeleton";
import { GET_CATEGORIES, GET_PRODUCTS } from "../graphql/product.queries";
import type {
  CategoriesResponse,
  ProductsResponse,
  ProductsVariables,
} from "../types/product.types";
import { getErrorMessage } from "../../../lib/errors";

const sortOptions = [
  {
    label: "Newest First",
    value: "createdAt-desc",
    sortBy: "createdAt",
    sortOrder: "desc",
  },
  {
    label: "Price: Low to High",
    value: "price-asc",
    sortBy: "price",
    sortOrder: "asc",
  },
  {
    label: "Price: High to Low",
    value: "price-desc",
    sortBy: "price",
    sortOrder: "desc",
  },
  {
    label: "Name: A to Z",
    value: "name-asc",
    sortBy: "name",
    sortOrder: "asc",
  },
];

const ProductListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedSort =
    sortOptions.find((option) => option.value === searchParams.get("sort")) ??
    sortOptions[0];
  const page = Math.max(Number(searchParams.get("page") ?? "1"), 1);
  const search = searchParams.get("q") ?? undefined;
  const categoryId = searchParams.get("category") ?? undefined;
  const minPriceValue = searchParams.get("minPrice");
  const maxPriceValue = searchParams.get("maxPrice");
  const minPrice = minPriceValue ? Number(minPriceValue) : undefined;
  const maxPrice = maxPriceValue ? Number(maxPriceValue) : undefined;

  const queryVariables: ProductsVariables = {
    page,
    limit: 8,
    search,
    categoryId,
    minPrice: Number.isFinite(minPrice) ? minPrice : undefined,
    maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
    sortBy: selectedSort.sortBy,
    sortOrder: selectedSort.sortOrder,
  };

  const { data, loading, error } = useQuery<
    ProductsResponse,
    ProductsVariables
  >(GET_PRODUCTS, {
    variables: queryVariables,
    fetchPolicy: "cache-and-network",
  });

  const { data: categoriesData } = useQuery<CategoriesResponse>(GET_CATEGORIES);

  const products = data?.products.items ?? [];
  const totalProducts = data?.products.total ?? 0;
  const totalPages = data?.products.totalPages ?? 1;

  const visiblePages = useMemo(() => {
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, page + 2);
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [page, totalPages]);

  const updateParams = (updates: Record<string, string | undefined>) => {
    const nextParams = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (!value) {
        nextParams.delete(key);
      } else {
        nextParams.set(key, value);
      }
    });

    if (!("page" in updates)) {
      nextParams.set("page", "1");
    }

    setSearchParams(nextParams);
  };

  const updatePage = (nextPage: number) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("page", String(nextPage));
    setSearchParams(nextParams);
  };

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        {getErrorMessage(error, "We could not load products right now.")}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] border bg-[linear-gradient(135deg,#fff7ed,#ffffff_45%,#eff6ff)] p-6 shadow-sm md:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div className="space-y-4">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-gray-500">
              Marketplace
            </p>
            <h1 className="max-w-3xl text-4xl font-black tracking-tight text-gray-900 md:text-5xl">
              Discover products with faster browsing and cleaner filters.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-gray-600">
              Search across the catalog, refine by category or price, and jump
              through pages without losing your place.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/80 p-4 shadow-sm">
              <p className="text-sm text-gray-500">Products Found</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {totalProducts}
              </p>
            </div>
            <div className="rounded-2xl bg-white/80 p-4 shadow-sm">
              <p className="text-sm text-gray-500">Current Page</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{page}</p>
            </div>
            <div className="rounded-2xl bg-white/80 p-4 shadow-sm">
              <p className="text-sm text-gray-500">Pages</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {totalPages}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <select
            value={categoryId ?? ""}
            onChange={(e) =>
              updateParams({
                category: e.target.value || undefined,
              })
            }
            className="rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
          >
            <option value="">All Categories</option>
            {categoriesData?.categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            min="0"
            value={minPriceValue ?? ""}
            onChange={(e) =>
              updateParams({
                minPrice: e.target.value || undefined,
              })
            }
            placeholder="Min price"
            className="rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-black"
          />

          <input
            type="number"
            min="0"
            value={maxPriceValue ?? ""}
            onChange={(e) =>
              updateParams({
                maxPrice: e.target.value || undefined,
              })
            }
            placeholder="Max price"
            className="rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-black"
          />

          <select
            value={selectedSort.value}
            onChange={(e) =>
              updateParams({
                sort: e.target.value,
              })
            }
            className="rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setSearchParams(search ? { q: search } : {})}
            className="rounded-xl border px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Reset Filters
          </button>
        </div>

        {(search || categoryId || minPriceValue || maxPriceValue) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {search && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                Search: {search}
              </span>
            )}
            {categoryId && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                Category filtered
              </span>
            )}
            {minPriceValue && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                Min: {minPriceValue}
              </span>
            )}
            {maxPriceValue && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                Max: {maxPriceValue}
              </span>
            )}
          </div>
        )}
      </section>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed bg-gray-50 p-12 text-center">
          <h2 className="text-xl font-semibold text-gray-900">No products found</h2>
          <p className="mt-2 text-sm text-gray-500">
            Try changing your search, price range, or category filter.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <section className="flex flex-col items-center justify-between gap-4 rounded-2xl border bg-white p-4 shadow-sm md:flex-row">
            <button
              type="button"
              onClick={() => updatePage(page - 1)}
              disabled={page <= 1}
              className="rounded-xl border px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Prev
            </button>

            <div className="flex flex-wrap items-center justify-center gap-2">
              {visiblePages.map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => updatePage(pageNumber)}
                  className={`min-w-10 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    pageNumber === page
                      ? "bg-black text-white"
                      : "border text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {pageNumber}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => updatePage(page + 1)}
              disabled={page >= totalPages}
              className="rounded-xl border px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </section>
        </>
      )}
    </div>
  );
};

export default ProductListPage;
