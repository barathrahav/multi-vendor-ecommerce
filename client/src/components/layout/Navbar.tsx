import { useApolloClient } from "@apollo/client/react";
import { useEffect, useRef, useState } from "react";
import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
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
  Image,
  Layers,
  Users,
  Package,
  PlusCircle,
} from "lucide-react";
import { GET_UNREAD_NOTIFICATION_COUNT } from "../../features/notifications/graphql/notification.queries";


const Navbar = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const apolloClient = useApolloClient();
  const [searchParams] = useSearchParams();
  const isVendor = user?.role === "VENDOR";
  const isAdmin = user?.role === "ADMIN";
  const isCustomer = user?.role === "CUSTOMER";
  const [searchValue, setSearchValue] = useState(searchParams.get("q") ?? "");
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("theme") === "dark",
  );
  const dashboardRef = useRef<HTMLDivElement | null>(null);
  const accountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

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
    skip: !isAuthenticated || loading,
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
    <nav className="sticky top-0 z-50 border-b border-slate-200/70 dark:border-slate-700/70 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl shadow-sm dark:shadow-xl">
      <div className="page-shell flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <ShoppingCart size={22} />
          E-Commerce
        </Link>

        {/* Search */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden md:flex flex-1 max-w-3xl"
        >
          <div className="flex w-full items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2 focus-within:ring-2 focus-within:ring-blue-500/50 dark:focus-within:ring-blue-400/50 transition-all">
            <Search size={18} className="text-slate-400 dark:text-slate-500 mr-2" />
            <input
              type="search"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-transparent outline-none text-sm text-slate-900 dark:text-slate-50 placeholder:text-slate-500 dark:placeholder:text-slate-400"
            />
          </div>
        </form>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
          >
            <Home size={18} />
            <span className="hidden lg:inline">Home</span>
          </Link>

          <button
            type="button"
            aria-label="Toggle color theme"
            onClick={() => setDarkMode((enabled) => !enabled)}
            className="icon-btn"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* CUSTOMER */}
          {!loading && isAuthenticated && isCustomer && (
            <>
              <Link
                to="/cart"
                className="relative flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
              >
                <ShoppingCart size={18} />
                <span className="hidden lg:inline">Cart</span>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-3 bg-blue-600 dark:bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full font-semibold shadow-sm">
                    {cartCount}
                  </span>
                )}
              </Link>
              {cartError && (
                <span className="text-xs text-red-600 dark:text-red-400">
                  {getErrorMessage(cartError, "Cart unavailable")}
                </span>
              )}

              <Link
                to="/orders"
                className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors hidden lg:inline"
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
                className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium
                            bg-gradient-to-r from-white/80 to-gray-100/70
                            dark:from-gray-800 dark:to-gray-700
                            backdrop-blur
                            border-gray-200 dark:border-gray-700
                            text-gray-700 dark:text-gray-300
                            shadow-sm hover:shadow-lg
                            hover:scale-[1.03]
                            transition-all duration-200"
              >
                <LayoutDashboard size={18} />
                Dashboard
                <ChevronDown size={15} />
              </button>

              {dashboardOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl shadow-lg dark:shadow-2xl p-2 animate-in fade-in slide-in-from-top-2 duration-150">
                  {isVendor && (
                    <div className="space-y-1">
                      {/* LABEL */}
                      <p
                        className="px-3 py-1 text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400 uppercase"
                      >
                        Vendor
                      </p>

                      <Link
                        to="/vendor"
                        onClick={() => setDashboardOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium
                                    text-slate-700 dark:text-slate-300
                                    hover:bg-slate-100 dark:hover:bg-slate-700
                                    transition-colors"
                      >
                        <LayoutDashboard size={16} /> 
                        Vendor Dashboard
                      </Link>

                      <Link
                        to="/vendor/products"
                        onClick={() => setDashboardOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium
                                    text-slate-700 dark:text-slate-300
                                    hover:bg-slate-100 dark:hover:bg-slate-700
                                    transition-colors"
                      >
                        <Package size={16} />
                         My Products
                      </Link>

                      <Link
                        to="/vendor/create"
                        onClick={() => setDashboardOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium
                                    text-slate-700 dark:text-slate-300
                                    hover:bg-slate-100 dark:hover:bg-slate-700
                                    transition-colors"
                      >
                        <PlusCircle size={16} />
                         Create Product
                      </Link>

                      <Link
                        to="/vendor/orders"
                        onClick={() => setDashboardOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium
                                    text-slate-700 dark:text-slate-300
                                    hover:bg-slate-100 dark:hover:bg-slate-700
                                    transition-colors"
                      >
                        <ShoppingCart size={16} />
                         Vendor Orders
                      </Link>
                    </div>
                  )}

                  {isAdmin && (
                    <div className="space-y-1">
                      {/* TITLE (optional but adds hierarchy) */}
                      <p
                        className="px-3 py-1 text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400 uppercase"
                      >
                        Admin
                      </p>

                      <Link
                        to="/admin"
                        onClick={() => setDashboardOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium
                                    text-slate-700 dark:text-slate-300
                                    hover:bg-slate-100 dark:hover:bg-slate-700
                                    transition-colors"
                      >
                        <LayoutDashboard size={16} />
                         Admin Dashboard
                      </Link>

                      <Link
                        to="/admin/users"
                        onClick={() => setDashboardOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium
                                    text-slate-700 dark:text-slate-300
                                    hover:bg-slate-100 dark:hover:bg-slate-700
                                    transition-colors"
                      >
                        <Users size={16} />
                         Users
                      </Link>

                      <Link
                        to="/admin/orders"
                        onClick={() => setDashboardOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium
                                    text-slate-700 dark:text-slate-300
                                    hover:bg-slate-100 dark:hover:bg-slate-700
                                    transition-colors"
                      >
                        <ShoppingCart size={16} />
                         Orders
                      </Link>

                      <Link
                        to="/admin/categories"
                        onClick={() => setDashboardOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium
                                    text-slate-700 dark:text-slate-300
                                    hover:bg-slate-100 dark:hover:bg-slate-700
                                    transition-colors"
                      >
                        <Layers size={16} />
                         Categories
                      </Link>

                      <Link
                        to="/admin/carousel"
                        onClick={() => setDashboardOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium
                                    text-slate-700 dark:text-slate-300
                                    hover:bg-slate-100 dark:hover:bg-slate-700
                                    transition-colors"
                      >
                        <Image size={16} />
                         Carousel
                      </Link>
                    </div>
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
                className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
              >
                <LogIn size={18} />
                <span className="hidden lg:inline">Login</span>
              </Link>

              <Link
                to="/register"
                className="flex items-center gap-1 text-sm bg-blue-600 dark:bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-semibold shadow-sm hover:shadow-md"
              >
                <UserPlus size={18} />
                <span className="hidden lg:inline">Register</span>
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
                className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium
                            bg-gradient-to-r from-white/80 to-gray-100/70
                            dark:from-gray-800 dark:to-gray-700
                            backdrop-blur
                            border-gray-200 dark:border-gray-700
                            text-gray-700 dark:text-gray-300
                            shadow-sm hover:shadow-lg
                            hover:scale-[1.03]
                            transition-all duration-200"
              >
                <User size={17} />
                <span className="max-w-28 truncate">{user?.name}</span>
                <ChevronDown size={15} />
              </button>

              {accountOpen && (
                <div
                  className="absolute right-0 mt-3 w-60 rounded-lg border
                              bg-white/95 dark:bg-slate-800/95
                              backdrop-blur-xl
                              border-slate-200 dark:border-slate-700
                              shadow-xl dark:shadow-2xl p-2 space-y-1
                              animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  {/* PROFILE */}
                  <Link
                    to="/profile"
                    onClick={() => setAccountOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm
                                text-slate-700 dark:text-slate-300
                                hover:bg-slate-100 dark:hover:bg-slate-700
                                transition-colors"
                  >
                    <User
                      size={16}
                      className="text-slate-500 dark:text-slate-400"
                    />
                    Profile
                  </Link>

                  {/* NOTIFICATIONS */}
                  <Link
                    to="/notifications"
                    onClick={() => setAccountOpen(false)}
                    className="flex items-center justify-between rounded-lg px-3 py-2 text-sm
                                text-slate-700 dark:text-slate-300
                                hover:bg-slate-100 dark:hover:bg-slate-700
                                transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <Bell
                        size={16}
                        className="text-slate-500 dark:text-slate-400"
                      />
                      Notifications
                    </span>

                    {unreadNotifications > 0 && (
                      <span
                        className="rounded-full px-2 py-0.5 text-xs font-semibold
                                    bg-blue-600 dark:bg-blue-500
                                    text-white shadow-sm"
                      >
                        {unreadNotifications}
                      </span>
                    )}
                  </Link>

                  {/* WISHLIST */}
                  {isCustomer && (
                    <Link
                      to="/wishlist"
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm
                                  text-slate-700 dark:text-slate-300
                                  hover:bg-slate-100 dark:hover:bg-slate-700
                                  transition-colors"
                    >
                      <Heart
                        size={16}
                        className="text-slate-500 dark:text-slate-400"
                      />
                      Wishlist
                    </Link>
                  )}

                  {/* ORDERS */}
                  {isCustomer && (
                    <Link
                      to="/orders"
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm
                                  text-slate-700 dark:text-slate-300
                                  hover:bg-slate-100 dark:hover:bg-slate-700
                                  transition-colors"
                    >
                      <Package
                        size={16}
                        className="text-slate-500 dark:text-slate-400"
                      />
                      Orders
                    </Link>
                  )}

                  {/* DIVIDER */}
                  <div className="my-1 border-t border-slate-200 dark:border-slate-700" />

                  {/* LOGOUT */}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm
                                text-red-600 dark:text-red-400
                                hover:bg-red-50 dark:hover:bg-red-900/20
                                transition-colors"
                  >
                    <LogOut size={16} />
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



