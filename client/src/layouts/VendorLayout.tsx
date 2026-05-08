import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import { Package, PlusCircle, ShoppingCart } from "lucide-react";

interface VendorLayoutProps {
  children: ReactNode;
}

const VendorLayout = ({ children }: VendorLayoutProps) => {
  const location = useLocation();

  const navItems = [
    {
      name: "My Products",
      path: "/vendor/products",
      icon: <Package size={16} />,
    },
    {
      name: "Create Product",
      path: "/vendor/create",
      icon: <PlusCircle size={16} />,
    },
    {
      name: "Orders",
      path: "/vendor/orders",
      icon: <ShoppingCart size={16} />,
    },
  ];

  return (
    <div className="app-shell min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Navbar />

      <div className="page-shell flex flex-col gap-6 lg:flex-row lg:items-start">

        {/* SIDEBAR */}
        <aside className="w-full lg:w-72 rounded-[1.75rem] border border-slate-200/70 dark:border-slate-700/70 bg-white/95 dark:bg-slate-950/90 shadow-sm p-5">
          <h2 className="mb-6 text-lg font-semibold text-slate-900 dark:text-white">
            Vendor Panel
          </h2>

          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-slate-900 text-white dark:bg-slate-200 dark:text-slate-950 shadow-sm"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* MAIN */}
        <main className="flex-1">
          <div className="page-card p-6">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
};

export default VendorLayout;
