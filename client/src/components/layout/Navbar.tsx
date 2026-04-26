import { useApolloClient } from "@apollo/client/react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { useQuery } from "@apollo/client/react";
import { GET_CART } from "../../features/cart/graphql/cart.queries";
import type { CartResponse } from "../../features/cart/types/cart.types";
import { getErrorMessage } from "../../lib/errors";
import {
  ShoppingCart,
  Home,
  LogIn,
  UserPlus,
  LogOut,
  LayoutDashboard,
  Search,
} from "lucide-react";

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

  const { data: cartData, error: cartError } = useQuery<CartResponse>(
    GET_CART,
    {
      skip: !isAuthenticated || !isCustomer,
      fetchPolicy: "cache-and-network",
    },
  );

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
    <nav className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur shadow-sm">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Logo */}
        <Link
          to="/"
          className="text-xl font-bold tracking-tight hover:opacity-80"
        >
          🛒 E-Commerce
        </Link>

        {/* Search */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden md:flex w-full max-w-xl mx-6"
        >
          <div className="flex w-full items-center rounded-full border bg-gray-100 px-4 py-2 focus-within:ring-2 focus-within:ring-black">
            <Search size={18} className="text-gray-500 mr-2" />
            <input
              type="search"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-transparent outline-none text-sm"
            />
          </div>
        </form>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-1 text-sm hover:text-black text-gray-600"
          >
            <Home size={18} />
            Home
          </Link>

          {/* CUSTOMER */}
          {!loading && isAuthenticated && isCustomer && (
            <>
              <Link
                to="/cart"
                className="relative flex items-center gap-1 text-sm hover:text-black text-gray-600"
              >
                <ShoppingCart size={18} />
                Cart
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-3 bg-black text-white text-xs px-1.5 py-0.5 rounded-full">
                    {cartCount}
                  </span>
                )}
              </Link>
              {cartError && (
                <span className="text-xs text-red-600">
                  {getErrorMessage(cartError, "Cart unavailable")}
                </span>
              )}

              <Link
                to="/orders"
                className="text-sm hover:text-black text-gray-600"
              >
                Orders
              </Link>
            </>
          )}

          {/* DASHBOARD */}
          {!loading && isAuthenticated && (isVendor || isAdmin) && (
            <details className="relative">
              <summary className="flex items-center gap-1 cursor-pointer text-sm text-gray-600 hover:text-black">
                <LayoutDashboard size={18} />
                Dashboard
              </summary>

              <div className="absolute right-0 mt-2 w-56 rounded-xl border bg-white shadow-lg p-2">
                {isVendor && (
                  <>
                    <Link
                      className="block px-3 py-2 rounded hover:bg-gray-100"
                      to="/vendor"
                    >
                      Vendor Dashboard
                    </Link>
                    <Link
                      className="block px-3 py-2 rounded hover:bg-gray-100"
                      to="/vendor/products"
                    >
                      My Products
                    </Link>
                    <Link
                      className="block px-3 py-2 rounded hover:bg-gray-100"
                      to="/vendor/orders"
                    >
                      Vendor Orders
                    </Link>
                  </>
                )}

                {isAdmin && (
                  <>
                    <Link
                      className="block px-3 py-2 rounded hover:bg-gray-100"
                      to="/admin"
                    >
                      Admin Dashboard
                    </Link>
                    <Link
                      className="block px-3 py-2 rounded hover:bg-gray-100"
                      to="/admin/users"
                    >
                      Users
                    </Link>
                    <Link
                      className="block px-3 py-2 rounded hover:bg-gray-100"
                      to="/admin/orders"
                    >
                      Orders
                    </Link>
                    <Link
                      className="block px-3 py-2 rounded hover:bg-gray-100"
                      to="/admin/categories"
                    >
                      Categories
                    </Link>
                  </>
                )}
              </div>
            </details>
          )}

          {/* AUTH */}
          {!isAuthenticated ? (
            <>
              <Link
                to="/login"
                className="flex items-center gap-1 text-sm hover:text-black text-gray-600"
              >
                <LogIn size={18} />
                Login
              </Link>

              <Link
                to="/register"
                className="flex items-center gap-1 text-sm bg-black text-white px-3 py-1.5 rounded hover:bg-gray-800"
              >
                <UserPlus size={18} />
                Register
              </Link>
            </>
          ) : (
            <>
              <span className="text-sm font-medium">{user?.name}</span>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-sm bg-black text-white px-3 py-1.5 rounded hover:bg-gray-800"
              >
                <LogOut size={18} />
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
