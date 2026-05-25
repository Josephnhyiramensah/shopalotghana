import { useState } from "react"
import { Link, Outlet, useLocation, useNavigate, Navigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import {
  FiGrid, FiShoppingBag, FiPackage, FiTag,
  FiSettings, FiMenu, FiX, FiLogOut,
  FiUsers, FiBarChart2, FiDownload,
  FiActivity, FiShield, FiLayers
} from "react-icons/fi"
import NotificationBell from "./components/NotificationBell"

const navItems = [
  {
    label: "Dashboard",
    to: "/admin",
    icon: "grid",
    roles: ["admin", "superadmin", "staff"]
  },
  {
    label: "Products",
    to: "/admin/products",
    icon: "bag",
    roles: ["admin", "superadmin", "staff"]
  },
  {
    label: "Inventory",
    to: "/admin/inventory",
    icon: "layers",
    roles: ["admin", "superadmin", "staff"]
  },
  {
    label: "Orders",
    to: "/admin/orders",
    icon: "package",
    roles: ["admin", "superadmin", "staff"]
  },
  {
    label: "Coupons",
    to: "/admin/coupons",
    icon: "tag",
    roles: ["admin", "superadmin", "staff"]
  },
  {
    label: "Analytics",
    to: "/admin/analytics",
    icon: "bar",
    roles: ["admin", "superadmin"]
  },
  {
    label: "Users",
    to: "/admin/users",
    icon: "users",
    roles: ["admin", "superadmin"]
  },
  {
    label: "Admin Manager",
    to: "/admin/admins",
    icon: "shield",
    roles: ["superadmin"]
  },
  {
    label: "Export Reports",
    to: "/admin/export",
    icon: "download",
    roles: ["admin", "superadmin"]
  },
  {
    label: "Audit Log",
    to: "/admin/audit",
    icon: "activity",
    roles: ["superadmin"]
  },
  {
    label: "Settings",
    to: "/admin/settings",
    icon: "settings",
    roles: ["admin", "superadmin"]
  },
]

function getIcon(name) {
  const icons = {
    grid:     <FiGrid size={18} />,
    bag:      <FiShoppingBag size={18} />,
    package:  <FiPackage size={18} />,
    tag:      <FiTag size={18} />,
    bar:      <FiBarChart2 size={18} />,
    users:    <FiUsers size={18} />,
    shield:   <FiShield size={18} />,
    download: <FiDownload size={18} />,
    activity: <FiActivity size={18} />,
    settings: <FiSettings size={18} />,
    layers:   <FiLayers size={18} />,
  }
  return icons[name]
}

function Sidebar({ user, visibleNav, isActive, onClose, onLogout }) {
  return (
    <div className="flex flex-col h-full">

      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center justify-between">
          <Link to="/">
            <span className="text-xl font-extrabold">
              <span className="text-[#FFA07A]">Shopalo</span>
              <span className="text-white">tghana</span>
            </span>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden text-white/60 hover:text-white"
          >
            <FiX size={20} />
          </button>
        </div>
      </div>

      {/* User info */}
      <div className="px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FFA07A] text-white
                          flex items-center justify-center font-bold
                          flex-shrink-0 text-lg">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-white text-sm truncate">
              {user?.name}
            </p>
            <span className={"text-xs font-bold px-2 py-0.5 rounded-lg capitalize " +
              (user?.role === "superadmin"
                ? "bg-purple-500/30 text-purple-200"
                : user?.role === "admin"
                ? "bg-blue-500/30 text-blue-200"
                : "bg-gray-500/30 text-gray-300")}>
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {visibleNav.map(function(item) {
          const active = isActive(item.to)
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={"flex items-center gap-3 px-4 py-3 rounded-xl mb-1 " +
                "text-sm font-semibold transition " +
                (active
                  ? "bg-[#FFA07A] text-white"
                  : "text-white/60 hover:bg-white/10 hover:text-white")}
            >
              {getIcon(item.icon)}
              {item.label}
              {item.label === "Admin Manager" && (
                <span className="ml-auto text-xs bg-purple-500/30
                                 text-purple-200 px-2 py-0.5 rounded-lg">
                  Super
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom links */}
      <div className="px-3 py-4 border-t border-white/10">
        <Link
          to="/"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm
                     font-semibold text-white/60 hover:bg-white/10
                     hover:text-white transition mb-1"
        >
          🏠 View Store
        </Link>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
                     text-sm font-semibold text-red-400
                     hover:bg-red-500/10 transition"
        >
          <FiLogOut size={18} /> Sign Out
        </button>
      </div>
    </div>
  )
}

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const location         = useLocation()
  const navigate         = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!user) return <Navigate to="/login" />
  if (!["admin", "superadmin", "staff"].includes(user.role)) {
    return <Navigate to="/" />
  }

  const isSuperAdmin = user?.role === "superadmin"

  const visibleNav = navItems.filter(function(item) {
    return item.roles.includes(user?.role)
  })

  function isActive(path) {
    if (path === "/admin") return location.pathname === "/admin"
    return location.pathname.startsWith(path)
  }

  function handleLogout() {
    logout()
    navigate("/")
  }

  const sidebarProps = {
    user,
    visibleNav,
    isActive,
    onClose:  function() { setSidebarOpen(false) },
    onLogout: handleLogout,
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col w-64 bg-[#1D3557] flex-shrink-0">
        <Sidebar {...sidebarProps} />
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={function() { setSidebarOpen(false) }}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={"fixed top-0 left-0 h-full w-64 bg-[#1D3557] z-50 " +
        "transform transition-transform duration-300 lg:hidden " +
        (sidebarOpen ? "translate-x-0" : "-translate-x-full")}>
        <Sidebar {...sidebarProps} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* ── Top header bar ── */}
        <header className="bg-white border-b border-gray-100 px-6 py-4
                           flex items-center justify-between flex-shrink-0">

          {/* Left — hamburger + page title */}
          <div className="flex items-center gap-3">
            <button
              onClick={function() { setSidebarOpen(true) }}
              className="lg:hidden text-gray-600 hover:text-[#FFA07A] transition"
            >
              <FiMenu size={22} />
            </button>
            <div>
              <h1 className="font-extrabold text-[#1D3557] text-lg">
                {visibleNav.find(function(n) {
                  return isActive(n.to)
                })?.label || "Admin"}
              </h1>
              <p className="text-xs text-gray-400">Shopalotghana Admin Panel</p>
            </div>
          </div>

          {/* Right — bell + badge + view store */}
          <div className="flex items-center gap-3">

            {/* 🔔 Notification Bell — lives here in the header */}
            <NotificationBell />

            {isSuperAdmin && (
              <span className="hidden sm:flex items-center gap-1 text-xs
                               bg-purple-100 text-purple-700 font-bold
                               px-3 py-1.5 rounded-xl">
                <FiShield size={12} /> Super Admin
              </span>
            )}

            <Link
              to="/"
              className="text-xs text-gray-500 hover:text-[#FFA07A]
                         font-medium transition"
            >
              View Store →
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}