import { useApolloClient } from "@apollo/client/react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
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
  User,
  ChevronDown,
  Bell,
  Heart,
  Moon,
  Sun,
} from "lucide-react";
import { GET_UNREAD_NOTIFICATION_COUNT } from "../../features/notifications/graphql/notification.queries";

const Navbar = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const apolloClient = useApolloClient();
  const [searchParams] = useSearchParams();
  const isVendor = user?.role === "VENDOR";
  const isAdmin = user?.role === "ADMIN";
  const isCustomer = user?.role === "CUSTOMER";
  const [searchValue, setSearchValue] = useState(searchParams.get("q") ?? "");
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("theme") === "dark"
  );
  const dashboardRef = useRef<HTMLDivElement | null>(null);
  const accountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setSearchValue(searchParams.get("q") ?? "");
  }, [searchParams]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    setDashboardOpen(false);
    setAccountOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;

      if (!dashboardRef.current?.contains(target)) {
        setDashboardOpen(false);
      }

      if (!accountRef.current?.contains(target)) {
        setAccountOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDashboardOpen(false);
        setAccountOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const { data: cartData, error: cartError } = useQuery<CartResponse>(
    GET_CART,
    {
      skip: !isAuthenticated || !isCustomer,
      fetchPolicy: "cache-and-network",
    },
  );
  const { data: notificationCountData } = useQuery<{
    unreadNotificationCount: number;
  }>(GET_UNREAD_NOTIFICATION_COUNT, {
    skip: !isAuthenticated,
    fetchPolicy: "cache-and-network",
  });

  const cartCount =
    cartData?.cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  const unreadNotifications =
    notificationCountData?.unreadNotificationCount ?? 0;

  const handleLogout = async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    await apolloClient.clearStore();
    setAccountOpen(false);
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

          <button
            type="button"
            aria-label="Toggle color theme"
            onClick={() => setDarkMode((enabled) => !enabled)}
            className="flex h-9 w-9 items-center justify-center rounded-full border text-gray-600 transition hover:bg-gray-50 hover:text-black"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

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
            <div className="relative" ref={dashboardRef}>
              <button
                type="button"
                onClick={() => {
                  setDashboardOpen((open) => !open);
                  setAccountOpen(false);
                }}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-black"
              >
                <LayoutDashboard size={18} />
                Dashboard
                <ChevronDown size={15} />
              </button>

              {dashboardOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border bg-white shadow-lg p-2">
                {isVendor && (
                  <>
                    <Link
                      className="block px-3 py-2 rounded hover:bg-gray-100"
                      to="/vendor"
                      onClick={() => setDashboardOpen(false)}
                    >
                      Vendor Dashboard
                    </Link>
                    <Link
                      className="block px-3 py-2 rounded hover:bg-gray-100"
                      to="/vendor/products"
                      onClick={() => setDashboardOpen(false)}
                    >
                      My Products
                    </Link>
                    <Link
                      className="block px-3 py-2 rounded hover:bg-gray-100"
                      to="/vendor/orders"
                      onClick={() => setDashboardOpen(false)}
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
                      onClick={() => setDashboardOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                    <Link
                      className="block px-3 py-2 rounded hover:bg-gray-100"
                      to="/admin/users"
                      onClick={() => setDashboardOpen(false)}
                    >
                      Users
                    </Link>
                    <Link
                      className="block px-3 py-2 rounded hover:bg-gray-100"
                      to="/admin/orders"
                      onClick={() => setDashboardOpen(false)}
                    >
                      Orders
                    </Link>
                    <Link
                      className="block px-3 py-2 rounded hover:bg-gray-100"
                      to="/admin/categories"
                      onClick={() => setDashboardOpen(false)}
                    >
                      Categories
                    </Link>
                  </>
                )}
              </div>
              )}
            </div>
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
            <div className="relative" ref={accountRef}>
              <button
                type="button"
                onClick={() => {
                  setAccountOpen((open) => !open);
                  setDashboardOpen(false);
                }}
                className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                <User size={17} />
                <span className="max-w-28 truncate">{user?.name}</span>
                <ChevronDown size={15} />
              </button>

              {accountOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border bg-white p-2 shadow-lg">
                  <Link
                    to="/profile"
                    onClick={() => setAccountOpen(false)}
                    className="block rounded px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Profile
                  </Link>
                  <Link
                    to="/notifications"
                    onClick={() => setAccountOpen(false)}
                    className="flex items-center justify-between rounded px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <span className="flex items-center gap-2">
                      <Bell size={16} />
                      Notifications
                    </span>
                    {unreadNotifications > 0 && (
                      <span className="rounded-full bg-black px-2 py-0.5 text-xs font-semibold text-white">
                        {unreadNotifications}
                      </span>
                    )}
                  </Link>
                  {isCustomer && (
                    <Link
                      to="/wishlist"
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-2 rounded px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Heart size={16} />
                      Wishlist
                    </Link>
                  )}
                  {isCustomer && (
                    <Link
                      to="/orders"
                      onClick={() => setAccountOpen(false)}
                      className="block rounded px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Orders
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-1 flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50"
                  >
                    <LogOut size={17} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
