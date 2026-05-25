import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import {
  FiShoppingBag, FiDollarSign, FiPackage,
  FiTrendingUp, FiClock, FiCheckCircle,
  FiXCircle, FiTruck, FiArrowRight,
  FiRefreshCw, FiAlertTriangle
} from "react-icons/fi"
import { formatGHS } from "../utils/formatCurrency"

const statusColors = {
  pending:    "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  shipped:    "bg-purple-100 text-purple-700",
  delivered:  "bg-green-100 text-green-700",
  cancelled:  "bg-red-100 text-red-700",
}

const statusIcons = {
  pending:    <FiClock size={13} />,
  processing: <FiRefreshCw size={13} />,
  shipped:    <FiTruck size={13} />,
  delivered:  <FiCheckCircle size={13} />,
  cancelled:  <FiXCircle size={13} />,
}

function StatCard({ icon, label, value, sub, color, bg }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100
                    hover:shadow-md transition">
      <div className="flex items-center justify-between mb-4">
        <div className={"w-12 h-12 rounded-2xl flex items-center justify-center " +
          bg + " " + color}>
          {icon}
        </div>
        <FiTrendingUp size={16} className="text-green-400" />
      </div>
      <p className="text-xl font-extrabold text-gray-800 mb-1 truncate">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
      {sub && <p className="text-xs text-green-500 font-medium mt-1">{sub}</p>}
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100
                    animate-pulse">
      <div className="flex justify-between mb-4">
        <div className="w-12 h-12 bg-gray-200 rounded-2xl" />
        <div className="w-5 h-5 bg-gray-200 rounded" />
      </div>
      <div className="h-7 bg-gray-200 rounded w-1/2 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-2/3" />
    </div>
  )
}

export default function Dashboard() {
  const [stats,            setStats]            = useState(null)
  const [recentOrders,     setRecentOrders]     = useState([])
  const [lowStockProducts, setLowStockProducts] = useState([])
  const [loading,          setLoading]          = useState(true)

  useEffect(function() {
    async function fetchData() {
      try {
        const [ordersRes, lowStockRes] = await Promise.all([
          axios.get("/orders?limit=5"),
          axios.get("/inventory/low-stock"),
        ])

        const orders = ordersRes.data.orders || []

        const totalRevenue = orders.reduce(function(sum, o) {
          return o.status !== "cancelled" ? sum + o.totalPrice : sum
        }, 0)

        const pending   = orders.filter(function(o) { return o.status === "pending" }).length
        const delivered = orders.filter(function(o) { return o.status === "delivered" }).length

        setStats({
          totalOrders: ordersRes.data.total || orders.length,
          totalRevenue,
          pending,
          delivered,
        })
        setRecentOrders(orders.slice(0, 5))
        setLowStockProducts(lowStockRes.data.products || [])
      } catch {
        setStats({ totalOrders: 0, totalRevenue: 0, pending: 0, delivered: 0 })
        setRecentOrders([])
        setLowStockProducts([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {loading ? (
          [1, 2, 3, 4].map(function(i) { return <SkeletonCard key={i} /> })
        ) : (
          <>
            <StatCard
              icon={<FiShoppingBag size={22} />}
              label="Total Orders"
              value={stats.totalOrders}
              sub="All time orders"
              color="text-blue-600"
              bg="bg-blue-50"
            />
            <StatCard
              icon={<FiDollarSign size={22} />}
              label="Total Revenue"
              value={formatGHS(stats.totalRevenue)}
              sub="Excluding cancelled"
              color="text-green-600"
              bg="bg-green-50"
            />
            <StatCard
              icon={<FiClock size={22} />}
              label="Pending Orders"
              value={stats.pending}
              sub="Needs attention"
              color="text-yellow-600"
              bg="bg-yellow-50"
            />
            <StatCard
              icon={<FiCheckCircle size={22} />}
              label="Delivered"
              value={stats.delivered}
              sub="Completed orders"
              color="text-purple-600"
              bg="bg-purple-50"
            />
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Add Product", to: "/admin/products", color: "bg-[#FF4500]", icon: "➕" },
          { label: "View Orders", to: "/admin/orders",   color: "bg-[#1D3557]", icon: "📦" },
          { label: "Inventory",   to: "/admin/inventory",color: "bg-teal-600",  icon: "🏭" },
          { label: "Settings",    to: "/admin/settings", color: "bg-purple-600",icon: "⚙️" },
        ].map(function(action) {
          return (
            <Link
              key={action.label}
              to={action.to}
              className={"flex items-center justify-between px-5 py-4 rounded-2xl " +
                "text-white font-bold text-sm hover:opacity-90 transition " +
                action.color}
            >
              <span>{action.label}</span>
              <span className="text-xl">{action.icon}</span>
            </Link>
          )
        })}
      </div>

      {/* ✅ Low Stock Alert Widget */}
      {!loading && lowStockProducts.length > 0 && (
        <div className="bg-white rounded-2xl border border-yellow-200
                        shadow-sm overflow-hidden mb-8">

          {/* Widget header */}
          <div className="flex items-center justify-between px-6 py-4
                          border-b border-yellow-100 bg-yellow-50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-yellow-100 rounded-xl flex items-center
                              justify-center">
                <FiAlertTriangle size={18} className="text-yellow-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-sm">
                  Low Stock Alert
                </h3>
                <p className="text-xs text-gray-500">
                  {lowStockProducts.length} product(s) need restocking
                </p>
              </div>
            </div>
            <Link
              to="/admin/inventory"
              className="text-xs font-bold text-[#FF4500] hover:underline
                         flex items-center gap-1"
            >
              Manage Inventory <FiArrowRight size={12} />
            </Link>
          </div>

          {/* Product list */}
          <div className="divide-y divide-gray-50">
            {lowStockProducts.slice(0, 5).map(function(product) {
              return (
                <div
                  key={product._id}
                  className="flex items-center gap-4 px-6 py-3
                             hover:bg-gray-50 transition"
                >
                  <img
                    src={product.images?.[0]?.url ||
                      "https://placehold.co/40x40?text=P"}
                    alt={product.name}
                    className="w-10 h-10 rounded-xl object-cover
                               border border-gray-100 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm line-clamp-1">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-500">{product.category}</p>
                  </div>
                  <span className={"text-xs font-bold px-3 py-1 rounded-xl " +
                    (product.stock === 0
                      ? "bg-red-100 text-red-600"
                      : "bg-yellow-100 text-yellow-700")}>
                    {product.stock === 0
                      ? "Out of Stock"
                      : product.stock + " left"}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Show more link */}
          {lowStockProducts.length > 5 && (
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100
                            text-center">
              <Link
                to="/admin/inventory"
                className="text-xs font-bold text-[#FF4500] hover:underline"
              >
                View all {lowStockProducts.length} low stock products →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100
                      overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b">
          <h2 className="font-extrabold text-[#1D3557] text-lg">
            Recent Orders
          </h2>
          <Link
            to="/admin/orders"
            className="text-sm text-[#FF4500] font-semibold flex items-center
                       gap-1 hover:gap-2 transition-all"
          >
            View All <FiArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map(function(i) {
              return (
                <div key={i} className="animate-pulse flex gap-4">
                  <div className="h-10 bg-gray-200 rounded-xl flex-1" />
                </div>
              )
            })}
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <div className="text-5xl mb-3">📭</div>
            <p className="font-medium">No orders yet</p>
            <p className="text-sm">Orders will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="text-left px-6 py-3">Order ID</th>
                  <th className="text-left px-6 py-3">Customer</th>
                  <th className="text-left px-6 py-3">Amount</th>
                  <th className="text-left px-6 py-3">Status</th>
                  <th className="text-left px-6 py-3">Date</th>
                  <th className="text-left px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map(function(order) {
                  return (
                    <tr key={order._id}
                      className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-mono text-xs text-gray-500">
                        #{order._id.slice(-6).toUpperCase()}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-800">
                        {order.user?.name || order.guestInfo?.name || "Guest"}
                      </td>
                      <td className="px-6 py-4 font-bold text-[#1D3557]">
                        {formatGHS(order.totalPrice)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={"inline-flex items-center gap-1.5 " +
                          "px-2.5 py-1 rounded-xl text-xs font-semibold " +
                          "capitalize " +
                          (statusColors[order.status] || "bg-gray-100 text-gray-600")}>
                          {statusIcons[order.status]}
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-xs">
                        {new Date(order.createdAt).toLocaleDateString("en-GH", {
                          day: "numeric", month: "short", year: "numeric"
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          to="/admin/orders"
                          className="text-[#FF4500] text-xs font-semibold
                                     hover:underline"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}