import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth"
import { useCart } from "../../hooks/useCart"
import { useWishlist } from "../../hooks/useWishlist"
import { useSettings } from "../../hooks/useSettings"
import { trackSearch } from "../../utils/analytics"
import logo from "../../assets/logo.png"
import {
  FiShoppingCart, FiHeart, FiUser, FiMenu, FiX,
  FiSearch, FiChevronDown, FiLogOut, FiPackage,
  FiGrid, FiHome, FiInfo, FiShoppingBag
} from "react-icons/fi"

const CATEGORIES = [
  { name: "Kitchen Appliances",  icon: "🍳" },
  { name: "Electrical Appliances", icon: "⚡" },
  { name: "Plumbing Materials",  icon: "🔧" },
   { name: "Fashion",             icon: "👗" },
  { name: "Electronics",         icon: "📺" },
]

const mainLinks = [
  { label: "Home",      to: "/",        icon: <FiHome size={18} /> },
  { label: "Shop",      to: "/shop",    icon: <FiShoppingBag size={18} /> },
  { label: "About Us",  to: "/about",   icon: <FiInfo size={18} /> },
  { label: "My Orders", to: "/orders",  icon: <FiPackage size={18} /> },
  { label: "Wishlist",  to: "/wishlist", icon: <FiHeart size={18} /> },
]

const ADMIN_ROLES = ["admin", "superadmin", "staff"]

export default function Navbar() {
  const { user, logout }          = useAuth()
  const { itemCount }             = useCart()
  const { items: wishlistItems }  = useWishlist()
  const { settings }              = useSettings()
  const navigate                  = useNavigate()
  const location                  = useLocation()

  const [drawerOpen, setDrawerOpen]       = useState(false)
  const [searchOpen, setSearchOpen]       = useState(false)
  const [searchQuery, setSearchQuery]     = useState("")
  const [dropdownOpen, setDropdownOpen]   = useState(false)
  const [userMenuOpen, setUserMenuOpen]   = useState(false)
  const [categoriesOpen, setCategoriesOpen] = useState(false)

  const closeDrawer = function() { setDrawerOpen(false) }

  const handleSearch = function(e) {
    e.preventDefault()
    if (searchQuery.trim()) {
      trackSearch(searchQuery.trim())
      navigate("/shop?keyword=" + searchQuery.trim())
      setSearchOpen(false)
      setSearchQuery("")
      closeDrawer()
    }
  }

  const handleLogout = function() {
    logout()
    setUserMenuOpen(false)
    closeDrawer()
    navigate("/")
  }

  const isActive = function(path) {
    return location.pathname === path
  }

  const isAdmin = user && ADMIN_ROLES.includes(user.role)
  const threshold = settings?.freeDeliveryThreshold || 500

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-50">

        {/* Top announcement bar */}
        <div className="bg-[#1D3557] text-white text-xs text-center py-1.5 px-4">
          🚚 Free delivery on orders above GH₵{threshold} &nbsp;|&nbsp;
          Pay with MoMo, Card or Cash on Delivery 🇬🇭
        </div>

        {/* Main navbar */}
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center
                        justify-between gap-4">

          {/* Hamburger — mobile only */}
          <button
            onClick={function() { setDrawerOpen(true) }}
            className="lg:hidden text-gray-600 hover:text-[#FF4500] transition p-1"
            aria-label="Open menu"
          >
            <FiMenu size={26} />
          </button>

          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <img
              src={logo}
              alt="Shopalotghana"
              className="h-14 w-auto object-contain"
            />
          </Link>

          {/* Desktop search */}
          <form onSubmit={handleSearch}
            className="hidden lg:flex flex-1 max-w-xl">
            <div className="flex w-full border-2 border-[#FF4500]
                            rounded-xl overflow-hidden">
              <input
                type="text"
                value={searchQuery}
                onChange={function(e) { setSearchQuery(e.target.value) }}
                placeholder="Search for products..."
                className="flex-1 px-4 py-2.5 text-sm outline-none"
              />
              <button
                type="submit"
                className="bg-[#FF4500] text-white px-5 hover:bg-red-700 transition"
              >
                <FiSearch size={18} />
              </button>
            </div>
          </form>

          {/* Right icons */}
          <div className="flex items-center gap-3">

            {/* Mobile search toggle */}
            <button
              onClick={function() { setSearchOpen(!searchOpen) }}
              className="lg:hidden text-gray-600 hover:text-[#FF4500] transition"
            >
              <FiSearch size={22} />
            </button>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="relative text-gray-600 hover:text-[#FF4500]
                         transition hidden sm:block"
            >
              <FiHeart size={22} />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#FF4500] text-white
                                 text-xs rounded-full w-5 h-5 flex items-center
                                 justify-center font-bold">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative text-gray-600 hover:text-[#FF4500] transition"
            >
              <FiShoppingCart size={22} />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#FF4500] text-white
                                 text-xs rounded-full w-5 h-5 flex items-center
                                 justify-center font-bold">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* User menu — desktop */}
            {user ? (
              <div className="relative hidden lg:block">
                <button
                  onClick={function() { setUserMenuOpen(!userMenuOpen) }}
                  className="flex items-center gap-2 text-gray-700
                             hover:text-[#FF4500] transition"
                >
                  <div className="w-9 h-9 rounded-full bg-[#FF4500] text-white
                                  flex items-center justify-center font-bold text-sm
                                  flex-shrink-0">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left hidden xl:block">
                    <p className="text-xs font-bold text-gray-800 leading-tight">
                      {user.name?.split(" ")[0]}
                    </p>
                    <p className="text-xs text-gray-400 capitalize">{user.role}</p>
                  </div>
                  <FiChevronDown size={14} />
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={function() { setUserMenuOpen(false) }}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white border
                                    border-gray-100 rounded-2xl shadow-xl py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-bold text-sm text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                        <span className={"text-xs font-bold px-2 py-0.5 rounded-lg " +
                          "capitalize inline-block mt-1 " +
                          (user.role === "superadmin"
                            ? "bg-purple-100 text-purple-700"
                            : user.role === "admin"
                            ? "bg-blue-100 text-blue-700"
                            : user.role === "staff"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600")}>
                          {user.role}
                        </span>
                      </div>

                      {/* Admin dashboard — show for admin, superadmin, staff */}
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={function() { setUserMenuOpen(false) }}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm
                                     text-purple-600 hover:bg-purple-50 transition
                                     font-semibold"
                        >
                          <FiGrid size={15} /> Admin Dashboard
                        </Link>
                      )}

                      <Link
                        to="/profile"
                        onClick={function() { setUserMenuOpen(false) }}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm
                                   text-gray-700 hover:bg-gray-50 transition"
                      >
                        <FiUser size={15} /> My Profile
                      </Link>
                      <Link
                        to="/orders"
                        onClick={function() { setUserMenuOpen(false) }}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm
                                   text-gray-700 hover:bg-gray-50 transition"
                      >
                        <FiPackage size={15} /> My Orders
                      </Link>
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm
                                     text-red-500 hover:bg-red-50 w-full transition"
                        >
                          <FiLogOut size={15} /> Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden lg:flex items-center gap-2 bg-[#FF4500] text-white
                           px-4 py-2.5 rounded-xl text-sm font-bold
                           hover:bg-red-700 transition"
              >
                <FiUser size={16} /> Login
              </Link>
            )}
          </div>
        </div>

        {/* Category nav — desktop */}
        <div className="hidden lg:block border-t bg-white">
          <div className="max-w-7xl mx-auto px-4 flex items-center gap-6 py-2">

            {/* All categories dropdown */}
            <div
              className="relative"
              onMouseEnter={function() { setDropdownOpen(true) }}
              onMouseLeave={function() { setDropdownOpen(false) }}
            >
              <button className="flex items-center gap-2 text-sm font-bold
                                 text-[#1D3557] hover:text-[#FF4500] transition">
                <FiGrid size={16} /> All Categories
                <FiChevronDown size={13} />
              </button>
              {dropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-60 bg-white
                                border border-gray-100 rounded-2xl shadow-xl
                                py-2 z-50">
                  {CATEGORIES.map(function(cat) {
                    return (
                      <Link
                        key={cat.name}
                        to={"/shop?category=" + encodeURIComponent(cat.name)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm
                                   text-gray-700 hover:bg-red-50
                                   hover:text-[#FF4500] transition"
                      >
                        <span>{cat.icon}</span>
                        {cat.name}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Individual category links */}
            {CATEGORIES.map(function(cat) {
              return (
                <Link
                  key={cat.name}
                  to={"/shop?category=" + encodeURIComponent(cat.name)}
                  className="text-sm text-gray-600 hover:text-[#FF4500]
                             transition whitespace-nowrap"
                >
                  {cat.icon} {cat.name}
                </Link>
              )
            })}

            <Link
              to="/shop?tag=sale"
              className="text-sm font-bold text-[#FF4500] ml-auto
                         flex items-center gap-1"
            >
              🔥 Sale
            </Link>
          </div>
        </div>

        {/* Mobile search bar */}
        {searchOpen && (
          <div className="lg:hidden px-4 pb-3 bg-white border-t">
            <form
              onSubmit={handleSearch}
              className="flex border-2 border-[#FF4500] rounded-xl overflow-hidden"
            >
              <input
                type="text"
                value={searchQuery}
                onChange={function(e) { setSearchQuery(e.target.value) }}
                placeholder="Search products..."
                className="flex-1 px-4 py-2.5 text-sm outline-none"
                autoFocus
              />
              <button
                type="submit"
                className="bg-[#FF4500] text-white px-4 hover:bg-red-700 transition"
              >
                <FiSearch size={18} />
              </button>
            </form>
          </div>
        )}
      </header>

      {/* Mobile Drawer Overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 lg:hidden"
          onClick={closeDrawer}
        />
      )}

      {/* Mobile Drawer */}
      <div className={"fixed top-0 left-0 h-full w-72 bg-white z-50 shadow-2xl " +
        "transform transition-transform duration-300 lg:hidden " +
        (drawerOpen ? "translate-x-0" : "-translate-x-full")}>

        {/* Drawer header */}
        <div className="bg-gradient-to-r from-[#1D3557] to-[#2d5a8e] px-5 py-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xl font-extrabold text-white">
              <span className="text-[#FF4500]">Shopalo</span>tghana
            </span>
            <button
              onClick={closeDrawer}
              className="text-white/70 hover:text-white transition"
            >
              <FiX size={22} />
            </button>
          </div>

          {user ? (
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#FF4500] text-white
                              flex items-center justify-center font-bold text-lg
                              flex-shrink-0">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-white font-bold text-sm">{user.name}</p>
                <p className="text-white/60 text-xs">{user.email}</p>
                <span className={"text-xs font-bold px-2 py-0.5 rounded-lg " +
                  "capitalize inline-block mt-0.5 " +
                  (user.role === "superadmin"
                    ? "bg-purple-500/30 text-purple-200"
                    : user.role === "admin"
                    ? "bg-blue-500/30 text-blue-200"
                    : "bg-gray-500/30 text-gray-300")}>
                  {user.role}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link
                to="/login"
                onClick={closeDrawer}
                className="flex-1 text-center bg-[#FF4500] text-white text-sm
                           font-bold py-2.5 rounded-xl hover:bg-red-700 transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={closeDrawer}
                className="flex-1 text-center bg-white/10 text-white text-sm
                           font-bold py-2.5 rounded-xl hover:bg-white/20 transition"
              >
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Drawer body */}
        <div className="overflow-y-auto h-full pb-24">

          {/* Main links */}
          <div className="p-4">
            <p className="text-xs font-bold text-gray-400 uppercase
                           tracking-widest mb-3 px-2">
              Navigation
            </p>
            {mainLinks.map(function(link) {
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={closeDrawer}
                  className={"flex items-center gap-3 px-4 py-3 rounded-xl " +
                    "text-sm font-semibold transition mb-1 " +
                    (isActive(link.to)
                      ? "bg-[#FF4500] text-white"
                      : "text-gray-700 hover:bg-gray-100")}
                >
                  {link.icon}
                  {link.label}
                </Link>
              )
            })}
          </div>

          {/* Categories */}
          <div className="px-4 pb-4">
            <button
              onClick={function() { setCategoriesOpen(!categoriesOpen) }}
              className="flex items-center justify-between w-full px-4 py-3
                         rounded-xl text-sm font-semibold text-gray-700
                         hover:bg-gray-100 transition mb-1"
            >
              <span className="flex items-center gap-3">
                <FiGrid size={18} /> Categories
              </span>
              <FiChevronDown
                size={16}
                className={"transition-transform " +
                  (categoriesOpen ? "rotate-180" : "")}
              />
            </button>

            {categoriesOpen && (
              <div className="ml-4 mt-1 space-y-1">
                {CATEGORIES.map(function(cat) {
                  return (
                    <Link
                      key={cat.name}
                      to={"/shop?category=" + encodeURIComponent(cat.name)}
                      onClick={closeDrawer}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl
                                 text-sm text-gray-600 hover:bg-red-50
                                 hover:text-[#FF4500] transition"
                    >
                      <span>{cat.icon}</span> {cat.name}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          {/* Admin dashboard link — for admin/superadmin/staff */}
          {isAdmin && (
            <div className="px-4 pb-2">
              <Link
                to="/admin"
                onClick={closeDrawer}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm
                           font-bold bg-purple-50 text-purple-700
                           hover:bg-purple-100 transition"
              >
                <FiGrid size={18} /> Admin Dashboard
              </Link>
            </div>
          )}

          {/* Profile + orders */}
          {user && (
            <div className="px-4 pb-2">
              <Link
                to="/profile"
                onClick={closeDrawer}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm
                           font-semibold text-gray-700 hover:bg-gray-100 transition mb-1"
              >
                <FiUser size={18} /> My Profile
              </Link>
            </div>
          )}

          {/* Logout */}
          {user && (
            <div className="px-4 pb-4 border-t border-gray-100 pt-3 mt-2">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm
                           font-semibold text-red-500 hover:bg-red-50
                           w-full transition"
              >
                <FiLogOut size={18} /> Sign Out
              </button>
            </div>
          )}

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center">
              © {new Date().getFullYear()} Shopalotghana.com 🇬🇭
            </p>
            <p className="text-xs text-gray-400 text-center mt-1">
              Quality Living, Locally Delivered
            </p>
          </div>
        </div>
      </div>
    </>
  )
}