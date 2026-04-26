import { Link } from "react-router-dom";
import { useMutation, useQuery } from "@apollo/client/react";
import toast from "react-hot-toast";

import { useAuth } from "../../auth/hooks/useAuth";
import { GET_PRODUCTS } from "../../products/graphql/product.queries";
import { DELETE_PRODUCT } from "../../products/graphql/product.mutations";
import type {
  DeleteProductResponse,
  DeleteProductVariables,
  ProductsResponse,
  ProductsVariables,
} from "../../products/types/product.types";
import ProductCardSkeleton from "../../products/components/ProductCardSkeleton";
import { getErrorMessage, reportError } from "../../../lib/errors";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const VendorProductsPage = () => {
  const { user, loading: authLoading } = useAuth();
  const vendorId = user?.id;
  const queryVariables: ProductsVariables = {
    vendorId,
    page: 1,
    limit: 50,
    sortBy: "createdAt",
    sortOrder: "desc",
  };

  const { data, loading, error } = useQuery<
    ProductsResponse,
    ProductsVariables
  >(GET_PRODUCTS, {
    skip: !vendorId,
    variables: queryVariables,
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    notifyOnNetworkStatusChange: true,
  });

  const [deleteProduct, { loading: isDeleting }] = useMutation<
    DeleteProductResponse,
    DeleteProductVariables
  >(DELETE_PRODUCT, {
    refetchQueries: [{ query: GET_PRODUCTS, variables: queryVariables }],
    awaitRefetchQueries: true,
    onCompleted: () => {
      toast.success("Product deleted successfully");
    },
    onError: (mutationError) => {
      toast.error(reportError(mutationError, "Could not delete product"));
    },
  });

  const products = data?.products.items ?? [];
  const totalProducts = data?.products.total ?? 0;
  const totalStock = products.reduce(
    (sum, product) => sum + (product.stock ?? 0),
    0
  );
  const inventoryValue = products.reduce(
    (sum, product) => sum + product.price * (product.stock ?? 0),
    0
  );

  if (authLoading || loading) {
    return (
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
        {getErrorMessage(error, "We could not load your products right now.")}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 rounded-2xl border bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
            Vendor Dashboard
          </p>
          <h1 className="text-3xl font-bold text-gray-900">My Products</h1>
          <p className="max-w-2xl text-sm text-gray-600">
            Track your catalog, inventory, and product value in one place.
          </p>
        </div>

        <Link
          to="/vendor/create"
          className="inline-flex items-center justify-center rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
        >
          Add New Product
        </Link>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Products</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {totalProducts}
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Units In Stock</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{totalStock}</p>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Inventory Value</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {currencyFormatter.format(inventoryValue)}
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Product Catalog
            </h2>
            <p className="text-sm text-gray-500">
              {totalProducts} product{totalProducts === 1 ? "" : "s"} listed
            </p>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-gray-50 p-10 text-center">
            <h3 className="text-lg font-semibold text-gray-900">
              No products yet
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Start building your store by creating your first product listing.
            </p>
            <Link
              to="/vendor/create"
              className="mt-5 inline-flex items-center justify-center rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              Create Product
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <article
                key={product.id}
                className="overflow-hidden rounded-2xl border bg-white shadow-sm"
              >
                <img
                  src={product.imageUrl || "https://via.placeholder.com/600x400"}
                  alt={product.name}
                  className="h-48 w-full object-cover"
                />

                <div className="space-y-4 p-5">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {product.name}
                      </h3>
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                        {product.category?.name || "Uncategorized"}
                      </span>
                    </div>

                    <p className="text-2xl font-bold text-gray-900">
                      {currencyFormatter.format(product.price)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
                    <span>Stock</span>
                    <span className="font-semibold text-gray-900">
                      {product.stock ?? 0} units
                    </span>
                  </div>

                  <div className="flex gap-3">
                    <Link
                      to={`/product/${product.id}`}
                      className="rounded-lg border px-4 py-2 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                      View Details
                    </Link>
                    <Link
                      to={`/vendor/products/${product.id}/edit`}
                      className="rounded-lg border px-4 py-2 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={() =>
                        void deleteProduct({
                          variables: { id: product.id },
                        })
                      }
                      className="rounded-lg bg-red-600 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default VendorProductsPage;
