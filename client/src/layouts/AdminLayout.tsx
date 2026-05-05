import { Link, useLocation } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import { Users, ShoppingCart, Layers } from "lucide-react";

const AdminLayout = ({ children }: any) => {
  const location = useLocation();

  const navItems = [
    {
      name: "Users",
      path: "/admin/users",
      icon: <Users size={16} />,
    },
    {
      name: "Orders",
      path: "/admin/orders",
      icon: <ShoppingCart size={16} />,
    },
    {
      name: "Categories",
      path: "/admin/categories",
      icon: <Layers size={16} />,
    },
  ];

  return (
    <div className="min-h-screen
      bg-gradient-to-br from-orange-50 via-white to-blue-50
      dark:from-gray-900 dark:via-black dark:to-gray-900">

      <Navbar />

      <div className="flex">

        {/* SIDEBAR */}
        <aside
          className="w-64 min-h-[calc(100vh-64px)] p-5
          border-r
          bg-white/70 dark:bg-gray-900/70
          backdrop-blur-xl
          border-gray-200 dark:border-gray-800"
        >
          <h2 className="mb-6 text-lg font-bold text-gray-900 dark:text-white">
            Admin Panel
          </h2>

          <nav className="flex flex-col gap-2">

            {navItems.map((item) => {
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition
                    ${
                      isActive
                        ? "bg-gradient-to-r from-black to-gray-800 dark:from-white dark:to-gray-300 text-white dark:text-black shadow-sm"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              );
            })}

          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-6">

          <div
            className="rounded-2xl border
            bg-white/80 dark:bg-white/5
            backdrop-blur
            border-gray-200 dark:border-gray-800
            shadow-sm p-6"
          >
            {children}
          </div>

        </main>

      </div>
    </div>
  );
};

export default AdminLayout;