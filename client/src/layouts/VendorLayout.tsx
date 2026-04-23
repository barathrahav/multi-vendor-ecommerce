import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";

const VendorLayout = ({ children }: any) => {
  return (
    <div>
      <Navbar />
      <div className="flex">
        <aside className="w-60 border-r p-4">
          <h2 className="mb-4 font-bold">Vendor</h2>

          <nav className="flex flex-col gap-2">
            <Link to="/vendor/products">My Products</Link>
            <Link to="/vendor/create">Create Product</Link>
            <Link to="/vendor/orders">Orders</Link>
          </nav>
        </aside>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
};

export default VendorLayout;
