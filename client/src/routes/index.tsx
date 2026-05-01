import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import ProtectedRoute from "./ProtectedRoute";
import MainLayout from "../layouts/MainLayout";
import ProductListPage from "../features/products/pages/ProductListPage";
import CartPage from "../features/cart/pages/CartPage";
import CheckoutPage from "../features/orders/pages/CheckoutPage";
import PaymentFailedPage from "../features/orders/pages/PaymentFailedPage";
import SuccessPage from "../features/orders/pages/SuccessPage";
import OrdersPage from "../features/orders/pages/OrdersPage";
import ProfilePage from "../features/auth/pages/ProfilePage";
import NotificationCenterPage from "../features/notifications/pages/NotificationCenterPage";
import WishlistPage from "../features/wishlist/pages/WishlistPage";
import ProductDetailsPage from "../features/products/pages/ProductDetailsPage";
import CreateVendorProductPage from "../features/vendor/pages/CreateProductPage";
import EditVendorProductPage from "../features/vendor/pages/EditProductPage";
import VendorProductsPage from "../features/vendor/pages/VendorProductsPage";
import VendorOrdersPage from "../features/vendor/pages/VendorOrdersPage";
import RoleProtectedRoute from "./RoleProtectedRoute";
import VendorLayout from "../layouts/VendorLayout";
import AdminLayout from "../layouts/AdminLayout";
import AdminCategoriesPage from "../features/admin/pages/AdminCategoriesPage";
import AdminUsersPage from "../features/admin/pages/AdminUsersPage";
import AdminOrdersPage from "../features/admin/pages/AdminOrdersPage";

const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <MainLayout>
            <ProductListPage />
          </MainLayout>
        }
      />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/cart"
        element={
          <ProtectedRoute>
            <MainLayout>
              <CartPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <MainLayout>
              <CheckoutPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/success"
        element={
          <MainLayout>
            <SuccessPage />
          </MainLayout>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <MainLayout>
              <OrdersPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/product/:id"
        element={
          <MainLayout>
            <ProductDetailsPage />
          </MainLayout>
        }
      />
      <Route
        path="/vendor/products"
        element={
          <RoleProtectedRoute allowedRoles={["VENDOR"]}>
            <VendorLayout>
              <VendorProductsPage />
            </VendorLayout>
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/payment-failed"
        element={
          <ProtectedRoute>
            <MainLayout>
              <PaymentFailedPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ProfilePage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <MainLayout>
              <NotificationCenterPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/wishlist"
        element={
          <ProtectedRoute>
            <MainLayout>
              <WishlistPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendor"
        element={
          <RoleProtectedRoute allowedRoles={["VENDOR"]}>
            <Navigate to="/vendor/products" replace />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/vendor/create"
        element={
          <RoleProtectedRoute allowedRoles={["VENDOR"]}>
            <VendorLayout>
              <CreateVendorProductPage />
            </VendorLayout>
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/vendor/products/:id/edit"
        element={
          <RoleProtectedRoute allowedRoles={["VENDOR"]}>
            <VendorLayout>
              <EditVendorProductPage />
            </VendorLayout>
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/vendor/orders"
        element={
          <RoleProtectedRoute allowedRoles={["VENDOR"]}>
            <VendorLayout>
              <VendorOrdersPage />
            </VendorLayout>
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <RoleProtectedRoute allowedRoles={["ADMIN"]}>
            <Navigate to="/admin/users" replace />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <RoleProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminLayout>
              <AdminUsersPage />
            </AdminLayout>
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <RoleProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminLayout>
              <AdminOrdersPage />
            </AdminLayout>
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/categories"
        element={
          <RoleProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminLayout>
              <AdminCategoriesPage />
            </AdminLayout>
          </RoleProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
