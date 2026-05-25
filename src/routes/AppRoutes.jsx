import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import ScrollToTop from "../components/common/ScrollToTop"
import MainLayout from "../components/layout/MainLayout"
import AdminLayout from "../admin/AdminLayout"

import Home from "../pages/Home"
import Shop from "../pages/Shop"
import ProductDetail from "../pages/ProductDetail"
import Cart from "../pages/Cart"
import Checkout from "../pages/Checkout"
import OrderConfirmation from "../pages/OrderConfirmation"
import OrderHistory from "../pages/OrderHistory"
import Login from "../pages/Login"
import Register from "../pages/Register"
import Profile from "../pages/Profile"
import Wishlist from "../pages/Wishlist"
import AboutUs from "../pages/AboutUs"
import ReturnPolicy from "../pages/ReturnPolicy"
import PrivacyPolicy from "../pages/PrivacyPolicy"
import TermsConditions from "../pages/TermsConditions"
import NotFound from "../pages/NotFound"
import ForgotPassword from "../pages/ForgotPassword"
import ResetPassword from "../pages/ResetPassword"

import Dashboard from "../admin/Dashboard"
import ProductManager from "../admin/ProductManager"
import OrderManager from "../admin/OrderManager"
import CouponManager from "../admin/CouponManager"
import AdminSettings from "../admin/Settings"
import Analytics from "../admin/Analytics"
import UserManager from "../admin/UserManager"
import AdminManager from "../admin/AdminManager"
import ExportReports from "../admin/ExportReports"
import AuditLogPage from "../admin/AuditLog"
import InventoryManager from "../admin/InventoryManager"

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" />
  return children
}

export default function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Routes>

        {/* Public routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/return-policy" element={<ReturnPolicy />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsConditions />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation/:id" element={<OrderConfirmation />} />
        </Route>

        {/* Protected routes */}
        <Route element={<MainLayout />}>
          <Route path="/orders" element={
            <ProtectedRoute><OrderHistory /></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute><Profile /></ProtectedRoute>
          } />
          <Route path="/wishlist" element={
            <ProtectedRoute><Wishlist /></ProtectedRoute>
          } />
        </Route>

        {/* Admin routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<ProductManager />} />
          <Route path="orders" element={<OrderManager />} />
          <Route path="coupons" element={<CouponManager />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="users" element={<UserManager />} />
          <Route path="admins" element={<AdminManager />} />
          <Route path="export" element={<ExportReports />} />
          <Route path="audit" element={<AuditLogPage />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="inventory" element={<InventoryManager />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </>
  )
}