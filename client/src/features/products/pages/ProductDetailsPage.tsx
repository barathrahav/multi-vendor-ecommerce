import { useApolloClient, useMutation, useQuery } from "@apollo/client/react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

import { ADD_TO_CART } from "../../cart/graphql/cart.mutations";
import {
  buildOptimisticCartForAdd,
  getCartFromCache,
  syncCartMutation,
  toOptimisticCartPayload,
} from "../../cart/utils/cartCache";
import { GET_PRODUCT } from "../graphql/product.queries";
import type { ProductDetailsResponse } from "../types/product.types";
import ProductDetailsSkeleton from "../components/ProductDetailsSkeleton";
import { getErrorMessage, reportError } from "../../../lib/errors";
import { X } from "lucide-react";
import { Heart } from "lucide-react";
import {
  ADD_TO_WISHLIST,
  REMOVE_FROM_WISHLIST,
} from "../../wishlist/graphql/wishlist.mutations";
import { GET_MY_WISHLIST } from "../../wishlist/graphql/wishlist.queries";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const apolloClient = useApolloClient();

  const { data, loading, error } = useQuery<ProductDetailsResponse>(
    GET_PRODUCT,
    {
      variables: { id },
    }
  );
  const { data: wishlistData } = useQuery<{
    myWishlist: Array<{ product: { id: string } }>;
  }>(GET_MY_WISHLIST, {
    skip: !localStorage.getItem("token"),
    fetchPolicy: "cache-and-network",
  });
  const isWished =
    !!id &&
    (wishlistData?.myWishlist.some((item) => item.product.id === id) ?? false);

  const [addToCart, { loading: isAddingToCart }] = useMutation(ADD_TO_CART, {
    update: syncCartMutation("addToCart"),
  });
  const [addToWishlist, { loading: isAddingWishlist }] = useMutation(
    ADD_TO_WISHLIST,
    {
      refetchQueries: [{ query: GET_MY_WISHLIST }],
    }
  );
  const [removeFromWishlist, { loading: isRemovingWishlist }] = useMutation(
    REMOVE_FROM_WISHLIST,
    {
      refetchQueries: [{ query: GET_MY_WISHLIST }],
    }
  );

  if (loading) return <ProductDetailsSkeleton />;

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        {getErrorMessage(error, "We could not load this product right now.")}
      </div>
    );
  }

  const product = data?.product;

  const handleAddToCart = async () => {
    const token = localStorage.getItem("token");

    if (!token || !product) {
      if (!token) {
        navigate("/login");
      }
      return;
    }

    const toastId = toast.loading("Adding product to cart...");

    try {
      const currentCart = getCartFromCache(apolloClient.cache);
      const optimisticCart = buildOptimisticCartForAdd(
        currentCart,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl ?? null,
        },
        1
      );

      await addToCart({
        variables: {
          productId: product.id,
          quantity: 1,
        },
        optimisticResponse: {
          addToCart: toOptimisticCartPayload(optimisticCart),
        },
      });

      toast.success("Added to cart", { id: toastId });
    } catch (cartError) {
      toast.error(reportError(cartError, "Could not add to cart"), {
        id: toastId,
      });
    }
  };

  const handleWishlistToggle = async () => {
    const token = localStorage.getItem("token");

    if (!token || !product) {
      navigate("/login");
      return;
    }

    try {
      if (isWished) {
        await removeFromWishlist({
          variables: { productId: product.id },
        });
        toast.success("Removed from wishlist");
        return;
      }

      await addToWishlist({
        variables: { productId: product.id },
      });
      toast.success("Added to wishlist");
    } catch (wishlistError) {
      toast.error(reportError(wishlistError, "Could not update wishlist"));
    }
  };

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
      <div className="relative overflow-hidden rounded-[2rem] border bg-white shadow-sm">
        <button
          type="button"
          aria-label="Close product details"
          onClick={() => navigate("/")}
          className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border bg-white/90 text-gray-700 shadow-sm transition hover:bg-gray-100"
        >
          <X size={20} />
        </button>
        <button
          type="button"
          aria-label={isWished ? "Remove from wishlist" : "Add to wishlist"}
          disabled={isAddingWishlist || isRemovingWishlist}
          onClick={() => void handleWishlistToggle()}
          className="absolute right-16 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border bg-white/90 text-gray-700 shadow-sm transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Heart
            size={20}
            className={isWished ? "fill-red-500 text-red-500" : ""}
          />
        </button>
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

                {/* <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">Available Stock</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {product.stock}
                  </p>
                </div> */}

                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">Sold By</p>
                  <p className="mt-2 text-lg font-semibold text-gray-900">
                    {product.vendor?.name || "Marketplace Vendor"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <button
                onClick={() => void handleAddToCart()}
                disabled={isAddingToCart || product.stock <= 0}
                className="w-full rounded-2xl bg-black px-5 py-4 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {isAddingToCart ? "Adding..." : "Add to Cart"}
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
