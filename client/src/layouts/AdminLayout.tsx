import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";

const AdminLayout = ({ children }: any) => {
  return (
    <div>
      <Navbar />
      <div className="flex">
        <aside className="w-60 border-r p-4">
          <h2 className="mb-4 font-bold">Admin</h2>

          <nav className="flex flex-col gap-2">
            <Link to="/admin/users">Users</Link>
            <Link to="/admin/orders">Orders</Link>
            <Link to="/admin/categories">Categories</Link>
          </nav>
        </aside>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
