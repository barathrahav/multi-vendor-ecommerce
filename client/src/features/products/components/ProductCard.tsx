import { useApolloClient, useMutation } from "@apollo/client/react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Heart } from "lucide-react";

import type { Product } from "../types/product.types";
import { ADD_TO_CART } from "../../cart/graphql/cart.mutations";
import {
  ADD_TO_WISHLIST,
  REMOVE_FROM_WISHLIST,
} from "../../wishlist/graphql/wishlist.mutations";
import { GET_MY_WISHLIST } from "../../wishlist/graphql/wishlist.queries";
import {
  buildOptimisticCartForAdd,
  getCartFromCache,
  syncCartMutation,
  toOptimisticCartPayload,
} from "../../cart/utils/cartCache";
import { reportError } from "../../../lib/errors";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const ProductCard = ({
  product,
  wishedProductIds = [],
}: {
  product: Product;
  wishedProductIds?: string[];
}) => {
  const navigate = useNavigate();
  const apolloClient = useApolloClient();
  const isWished = wishedProductIds.includes(product.id);

  const [addToCart, { loading }] = useMutation(ADD_TO_CART, {
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

  const handleAddToCart = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
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
    } catch (err) {
      toast.error(reportError(err, "Could not add to cart"), { id: toastId });
    }
  };

  const handleWishlistToggle = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
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
    } catch (err) {
      toast.error(reportError(err, "Could not update wishlist"));
    }
  };

  return (
    <article
      onClick={() => navigate(`/product/${product.id}`)}
      className="group cursor-pointer overflow-hidden rounded-[1.5rem] border border-gray-200 bg-white/95 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-2xl dark:border-gray-800 dark:bg-slate-900/90"
    >
      <div className="relative overflow-hidden bg-gray-100 dark:bg-slate-950">
        <button
          type="button"
          aria-label={isWished ? "Remove from wishlist" : "Add to wishlist"}
          disabled={isAddingWishlist || isRemovingWishlist}
          onClick={(e) => {
            e.stopPropagation();
            void handleWishlistToggle();
          }}
          className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-sm transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-900/90 dark:text-slate-200"
        >
          <Heart
            size={19}
            className={isWished ? "fill-red-500 text-red-500" : "text-slate-500 dark:text-slate-300"}
          />
        </button>
        <img
          src={product.imageUrl || "https://via.placeholder.com/600x500?text=Product"}
          alt={product.name}
          className="h-56 w-full object-cover transition duration-300 group-hover:scale-105"
        />
      </div>

      <div className="space-y-4 p-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <h3 className="line-clamp-1 text-lg font-semibold text-gray-900 dark:text-white">
              {product.name}
            </h3>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              {product.category?.name || "General"}
            </span>
          </div>

          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {currencyFormatter.format(product.price)}
          </p>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            void handleAddToCart();
          }}
          disabled={loading}
          className="w-full rounded-2xl bg-black px-4 py-3 text-sm font-semibold text-white shadow-sm transition duration-200 hover:bg-gray-900 disabled:cursor-not-allowed disabled:bg-gray-300 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 dark:disabled:bg-slate-700"
        >
          {loading ? "Adding..." : "Add to Cart"}
        </button>
      </div>
    </article>
  );
};

export default ProductCard;
