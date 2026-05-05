import { useApolloClient, useMutation, useQuery } from "@apollo/client/react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { X, Heart } from "lucide-react";

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

import {
  ADD_TO_WISHLIST,
  REMOVE_FROM_WISHLIST,
} from "../../wishlist/graphql/wishlist.mutations";
import { GET_MY_WISHLIST } from "../../wishlist/graphql/wishlist.queries";

import { getErrorMessage, reportError } from "../../../lib/errors";

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
    { variables: { id } }
  );

  const { data: wishlistData } = useQuery<any>(GET_MY_WISHLIST, {
    skip: !localStorage.getItem("token"),
  });

  const isWished =
    !!id &&
    wishlistData?.myWishlist.some((i: any) => i.product.id === id);

  const [addToCart, { loading: isAddingToCart }] = useMutation(ADD_TO_CART, {
    update: syncCartMutation("addToCart"),
  });

  const [addToWishlist] = useMutation(ADD_TO_WISHLIST, {
    refetchQueries: [{ query: GET_MY_WISHLIST }],
  });

  const [removeFromWishlist] = useMutation(REMOVE_FROM_WISHLIST, {
    refetchQueries: [{ query: GET_MY_WISHLIST }],
  });

  if (loading) return <ProductDetailsSkeleton />;

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-900/20 p-6 text-red-700 dark:text-red-300">
        {getErrorMessage(error)}
      </div>
    );
  }

  const product = data?.product;

  if (!product) {
    return (
      <div className="rounded-2xl border border-dashed bg-gray-50 dark:bg-gray-900 p-10 text-center">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          Product not found
        </h1>
      </div>
    );
  }

  const handleAddToCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    const toastId = toast.loading("Adding to cart...");

    try {
      const currentCart = getCartFromCache(apolloClient.cache);
      const optimisticCart = buildOptimisticCartForAdd(currentCart, product, 1);

      await addToCart({
        variables: { productId: product.id, quantity: 1 },
        optimisticResponse: {
          addToCart: toOptimisticCartPayload(optimisticCart),
        },
      });

      toast.success("Added to cart", { id: toastId });
    } catch (e) {
      toast.error(reportError(e), { id: toastId });
    }
  };

  const handleWishlistToggle = async () => {
    if (!localStorage.getItem("token")) return navigate("/login");

    if (isWished) {
      await removeFromWishlist({ variables: { productId: product.id } });
      toast.success("Removed from wishlist");
    } else {
      await addToWishlist({ variables: { productId: product.id } });
      toast.success("Added to wishlist");
    }
  };

  return (
    <div className="relative mx-auto max-w-6xl p-2 text-gray-900 dark:text-white
      bg-gradient-to-br from-orange-50 via-white to-blue-50
      dark:from-gray-900 dark:via-black dark:to-gray-900 rounded-[2rem]">

      {/* BACKGROUND GLOW */}
      <div className="absolute inset-0 -z-10 blur-3xl opacity-30
        bg-gradient-to-tr from-orange-200 via-blue-200 to-purple-200
        dark:from-blue-900 dark:via-purple-900 dark:to-black" />

      <div className="relative rounded-[2rem] border backdrop-blur
        bg-white/70 dark:bg-white/5
        bg-gradient-to-br from-white/80 to-white/40
        dark:from-white/5 dark:to-transparent shadow-xl">

        {/* ACTION BUTTONS */}
        <div className="absolute right-4 top-4 flex gap-3 z-20">
          <button
            onClick={() => navigate("/")}
            className="w-10 h-10 flex items-center justify-center rounded-full
              bg-white/80 dark:bg-gray-800 border dark:border-gray-700 hover:scale-105 transition">
            <X size={18} />
          </button>

          <button
            onClick={handleWishlistToggle}
            className="w-10 h-10 flex items-center justify-center rounded-full
              bg-white/80 dark:bg-gray-800 border dark:border-gray-700 hover:scale-105 transition">
            <Heart className={isWished ? "fill-red-500 text-red-500" : ""} />
          </button>
        </div>

        <div className="grid lg:grid-cols-2">

          {/* IMAGE */}
          <div className="p-6 md:p-10 rounded-l-[2rem]
            bg-gradient-to-br from-indigo-100 via-white to-blue-100
            dark:from-gray-800 dark:via-gray-900 dark:to-black">
            <img
              src={product.imageUrl || "https://via.placeholder.com/600"}
              className="rounded-xl shadow-xl hover:scale-105 transition"
            />
          </div>

          {/* DETAILS */}
          <div className="p-6 md:p-10 flex flex-col justify-between">

            <div className="space-y-6">

              {/* BADGES */}
              <div className="flex gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold
                  bg-gradient-to-r from-blue-100 to-purple-100
                  dark:from-gray-800 dark:to-gray-700">
                  {product.category?.name}
                </span>

                <span className="px-3 py-1 rounded-full text-xs font-semibold
                  bg-gradient-to-r from-gray-100 to-gray-200
                  dark:from-gray-800 dark:to-gray-700">
                  {product.stock > 0 ? "In Stock" : "Out of Stock"}
                </span>
              </div>

              <h1 className="text-4xl font-black">{product.name}</h1>

              <p className="text-gray-600 dark:text-gray-300">
                {product.description}
              </p>

              {/* INFO CARDS */}
              <div className="grid sm:grid-cols-2 gap-4">

  {/* PRICE */}
  <div className="p-5 rounded-xl border
    bg-gradient-to-br from-green-100 via-white to-green-50
    border-green-200
    shadow-sm hover:shadow-md transition
    dark:from-green-900/20 dark:via-gray-900 dark:to-gray-800
    dark:border-green-800">

    <p className="text-sm text-gray-500 dark:text-gray-400">Price</p>

    <p className="text-2xl font-bold text-gray-900 dark:text-white">
      {currencyFormatter.format(product.price)}
    </p>
  </div>

  {/* VENDOR */}
  <div className="p-5 rounded-xl border
    bg-gradient-to-br from-blue-50 via-white to-purple-50
    border-blue-200
    shadow-sm hover:shadow-md transition
    dark:from-gray-900 dark:via-gray-800 dark:to-gray-900
    dark:border-gray-700">

    <p className="text-sm text-gray-500 dark:text-gray-400">Vendor</p>

    <p className="font-semibold text-gray-900 dark:text-white">
      {product.vendor?.name}
    </p>
  </div>

</div>
            </div>

            {/* ACTION */}
            <div className="mt-8">
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="w-full rounded-2xl px-5 py-4 text-sm font-semibold
                  bg-gradient-to-r from-black to-gray-800
                  dark:from-white dark:to-gray-300
                  text-white dark:text-black
                  hover:scale-[1.02] transition">
                {isAddingToCart ? "Adding..." : "Add to Cart"}
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;