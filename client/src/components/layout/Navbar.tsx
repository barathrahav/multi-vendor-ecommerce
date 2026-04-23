import { useApolloClient } from "@apollo/client/react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { useQuery } from "@apollo/client/react";
import { GET_CART } from "../../features/cart/graphql/cart.queries";
import type { CartResponse } from "../../features/cart/types/cart.types";

const Navbar = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const apolloClient = useApolloClient();
  const [searchParams] = useSearchParams();
  const isVendor = user?.role === "VENDOR";
  const isAdmin = user?.role === "ADMIN";
  const isCustomer = user?.role === "CUSTOMER";
  const [searchValue, setSearchValue] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    setSearchValue(searchParams.get("q") ?? "");
  }, [searchParams]);

  const { data: cartData } = useQuery<CartResponse>(GET_CART, {
    skip: !isAuthenticated || !isCustomer,
    fetchPolicy: "cache-and-network",
  });

  const cartCount =
    cartData?.cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  const handleLogout = async () => {
    localStorage.removeItem("token");
    await apolloClient.clearStore();
    navigate("/login");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedQuery = searchValue.trim();
    const nextParams = new URLSearchParams();

    if (trimmedQuery) {
      nextParams.set("q", trimmedQuery);
    }

    navigate({
      pathname: "/",
      search: nextParams.toString(),
    });
  };

  return (
    <nav className="grid gap-4 border-b bg-white/90 px-6 py-4 backdrop-blur md:grid-cols-[auto_1fr_auto] md:items-center">
      <h1 className="text-xl font-bold md:justify-self-start">
        <Link to="/">E-Commerce</Link>
      </h1>

      <form
        onSubmit={handleSearchSubmit}
        className="flex w-full items-center justify-center md:px-8"
      >
        <div className="flex w-full max-w-2xl items-center overflow-hidden rounded-full border bg-gray-50 shadow-sm">
          <input
            type="search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search products, categories, or brands"
            className="w-full bg-transparent px-5 py-3 text-sm outline-none"
          />
          <button
            type="submit"
            className="rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            Search
          </button>
        </div>
      </form>

      <div className="flex flex-wrap items-center gap-4 md:justify-self-end">
        <Link to="/">Home</Link>

        {!loading && isAuthenticated && user?.role === "CUSTOMER" && (
          <>
            <Link to="/cart" className="relative inline-flex items-center">
              Cart
              {cartCount > 0 && (
                <span className="ml-2 inline-flex min-w-6 items-center justify-center rounded-full bg-black px-2 py-1 text-xs font-semibold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link to="/orders">Orders</Link>
          </>
        )}

        {!loading && isAuthenticated && (isVendor || isAdmin) && (
          <details className="relative">
            <summary className="cursor-pointer list-none rounded-lg border px-3 py-1 font-medium">
              Dashboard
            </summary>

            <div className="absolute right-0 top-10 z-10 min-w-52 rounded-xl border bg-white p-2 shadow-lg">
              {isVendor && (
                <>
                  <Link
                    to="/vendor"
                    className="block rounded-lg px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    Vendor Dashboard
                  </Link>
                  <Link
                    to="/vendor/products"
                    className="block rounded-lg px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    My Products
                  </Link>
                  <Link
                    to="/vendor/orders"
                    className="block rounded-lg px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    Vendor Orders
                  </Link>
                </>
              )}

              {isAdmin && (
                <>
                  <Link
                    to="/admin"
                    className="block rounded-lg px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    Admin Dashboard
                  </Link>
                  <Link
                    to="/admin/users"
                    className="block rounded-lg px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    Manage Users
                  </Link>
                  <Link
                    to="/admin/orders"
                    className="block rounded-lg px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    View Orders
                  </Link>
                  <Link
                    to="/admin/categories"
                    className="block rounded-lg px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    Manage Categories
                  </Link>
                </>
              )}
            </div>
          </details>
        )}

        {!isAuthenticated ? (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">
              Register
            </Link>
          </>
        ) : (
          <>
            <span className="font-medium">{user?.name}</span>

            <button
              onClick={handleLogout}
              className="bg-black text-white px-3 py-1 rounded"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
