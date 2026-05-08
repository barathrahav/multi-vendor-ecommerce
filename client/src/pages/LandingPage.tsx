import { useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import Carousel from "../components/carousel/Carousel";
import ProductCard from "../features/products/components/ProductCard";
import ProductCardSkeleton from "../features/products/components/ProductCardSkeleton";
import { GET_PRODUCTS } from "../features/products/graphql/product.queries";
import { GET_MY_WISHLIST } from "../features/wishlist/graphql/wishlist.queries";
import { GET_CAROUSEL_SLIDES } from "../features/admin/graphql/carousel.queries";
import { useAuth } from "../features/auth/hooks/useAuth";
import type {
  CarouselSlidesResponse,
  Product,
  ProductsResponse,
  ProductsVariables,
  WishlistResponse,
} from "../features/products/types/product.types";
import { getErrorMessage } from "../lib/errors";

const LandingPage = () => {
  // Fetch carousel slides from database
  const { data: carouselData, loading: carouselLoading } =
    useQuery<CarouselSlidesResponse>(GET_CAROUSEL_SLIDES);

  const { role } = useAuth();

  // Fetch featured products
  const { data, loading, error } = useQuery<
    ProductsResponse,
    ProductsVariables
  >(GET_PRODUCTS, {
    variables: {
      page: 1,
      limit: 12,
      sortBy: "createdAt",
      sortOrder: "desc",
    },
  });

  // Fetch wishlist only for authenticated customers
  const { data: wishlistData } = useQuery<WishlistResponse>(GET_MY_WISHLIST, {
    skip: role !== "CUSTOMER",
  });

  const products = data?.products.items ?? [];
  const wishedProductIds =
    wishlistData?.myWishlist.map((item) => item.product.id) ?? [];

  // Transform carousel slides for the carousel component
  const carouselItems = useMemo(() => {
    const colors = ["bg-blue-500", "bg-purple-500", "bg-orange-500", "bg-pink-500", "bg-green-500"];
    return (carouselData?.carouselSlides ?? []).map((slide, index) => ({
      id: slide.id,
      title: slide.title,
      description: slide.description,
      image: slide.imageUrl,
      color: colors[index % colors.length],
    }));
  }, [carouselData?.carouselSlides]);

  if (error) {
    return (
      <div className="rounded-xl p-6 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300">
        {getErrorMessage(error)}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 dark:from-gray-900 dark:via-black dark:to-gray-900">
      {/* Background Glow */}
      <div className="fixed inset-0 -z-10 blur-3xl opacity-30 pointer-events-none
        bg-gradient-to-tr from-orange-200 via-blue-200 to-purple-200
        dark:from-blue-900 dark:via-purple-900 dark:to-black" />

      {/* Hero Carousel Section */}
      <section className="relative w-full h-96 md:h-[28rem] overflow-hidden rounded-b-3xl shadow-xl">
        {carouselLoading ? (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">Loading carousel...</p>
          </div>
        ) : carouselItems.length > 0 ? (
          <Carousel items={carouselItems} autoPlayInterval={5000} />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-orange-400 to-pink-400 flex items-center justify-center">
            <p className="text-white text-lg font-semibold">Welcome to our store</p>
          </div>
        )}
      </section>

      {/* Featured Products Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Featured Products
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Discover our latest and most popular items
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))
          ) : products.length > 0 ? (
            products.map((product: Product) => (
              <ProductCard
                key={product.id}
                product={product}
                wishedProductIds={wishedProductIds}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                No products available
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-orange-500 to-pink-500 text-white py-16 mt-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Find What You Love?
          </h2>
          <p className="text-lg mb-8 text-white/90">
            Browse through thousands of products from verified vendors
          </p>
          <a
            href="/products"
            className="inline-block px-8 py-3 bg-white text-orange-500 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            Shop All Products
          </a>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
