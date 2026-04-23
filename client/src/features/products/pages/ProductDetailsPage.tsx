import { useParams } from "react-router-dom";
import { useQuery } from "@apollo/client/react";

import { GET_PRODUCT } from "../graphql/product.queries";
import type { ProductDetailsResponse } from "../types/product.types";
import Loader from "../../../components/common/Loader";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const ProductDetailsPage = () => {
  const { id } = useParams();

  const { data, loading, error } = useQuery<ProductDetailsResponse>(
    GET_PRODUCT,
    {
      variables: { id },
    }
  );

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        We could not load this product right now.
      </div>
    );
  }

  const product = data?.product;

  if (!product) {
    return (
      <div className="rounded-2xl border border-dashed bg-gray-50 p-10 text-center">
        <h1 className="text-xl font-semibold text-gray-900">Product not found</h1>
        <p className="mt-2 text-sm text-gray-500">
          This listing may have been removed or is no longer available.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="overflow-hidden rounded-[2rem] border bg-white shadow-sm">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative min-h-[340px] bg-[radial-gradient(circle_at_top,_#f5f3ff,_#e5e7eb_55%,_#ffffff)] p-6 md:p-10">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.1),rgba(255,255,255,0.8))]" />
            <img
              src={
                product.imageUrl ||
                "https://via.placeholder.com/900x700?text=Product"
              }
              alt={product.name}
              className="relative z-10 mx-auto h-full max-h-[520px] w-full rounded-[1.5rem] object-cover shadow-[0_25px_80px_-35px_rgba(15,23,42,0.45)]"
            />
          </div>

          <div className="flex flex-col justify-between p-6 md:p-10">
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-gray-600">
                    {product.category?.name || "General"}
                  </span>
                  <span className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-gray-600">
                    {product.stock > 0 ? "In Stock" : "Out of Stock"}
                  </span>
                </div>

                <h1 className="text-4xl font-black tracking-tight text-gray-900 md:text-5xl">
                  {product.name}
                </h1>

                <p className="max-w-2xl text-base leading-7 text-gray-600">
                  {product.description}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">Price</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {currencyFormatter.format(product.price)}
                  </p>
                </div>

                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">Available Stock</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {product.stock}
                  </p>
                </div>

                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">Sold By</p>
                  <p className="mt-2 text-lg font-semibold text-gray-900">
                    {product.vendor?.name || "Marketplace Vendor"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <button className="w-full rounded-2xl bg-black px-5 py-4 text-sm font-semibold text-white transition hover:bg-gray-800">
                Add to Cart
              </button>
              <p className="text-sm text-gray-500">
                Clean product details, upfront pricing, and current stock in one
                focused view.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
