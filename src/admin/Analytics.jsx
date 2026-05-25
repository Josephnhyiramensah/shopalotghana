import { useState, useEffect } from "react"
import axios from "axios"
import { formatGHS } from "../utils/formatCurrency"
import {
  FiTrendingUp, FiShoppingBag, FiUsers,
  FiPackage, FiDollarSign, FiArrowUp, FiArrowDown
} from "react-icons/fi"

function StatCard({ icon, label, value, growth, color, bg }) {
  const positive = Number(growth) >= 0
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <div className={"w-11 h-11 rounded-xl flex items-center justify-center " + bg + " " + color}>
          {icon}
        </div>
        {growth !== undefined && (
          <span className={"text-xs font-bold flex items-center gap-0.5 " +
            (positive ? "text-green-500" : "text-red-500")}>
            {positive ? <FiArrowUp size={12} /> : <FiArrowDown size={12} />}
            {Math.abs(growth)}%
          </span>
        )}
      </div>
      <p className="text-xl font-extrabold text-gray-800 truncate">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  )
}

function BarChart({ data }) {
  if (!data || data.length === 0) return null
  const max = Math.max(...data.map(function(d) { return d.revenue })) || 1
  return (
    <div className="flex items-end gap-2 h-40">
      {data.map(function(item) {
        const height = Math.round((item.revenue / max) * 100)
        return (
          <div key={item.month} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-xs text-gray-500 font-medium">
              {formatGHS(item.revenue).replace("GH₵", "")}
            </span>
            <div className="w-full relative group">
              <div
                className="w-full bg-gradient-to-t from-[#FFA07A] to-orange-300
                           rounded-t-lg transition-all duration-500 cursor-pointer
                           hover:from-orange-500 hover:to-orange-400"
                style={{ height: height + "px", minHeight: "4px" }}
              />
            </div>
            <span className="text-xs text-gray-400">{item.month}</span>
          </div>
        )
      })}
    </div>
  )
}

function DonutChart({ data }) {
  if (!data || data.length === 0) return null
  const total = data.reduce(function(sum, d) { return sum + d.count }, 0)
  const colors = ["#FFA07A", "#1D3557", "#10b981", "#8b5cf6"]
  const labels = {
    mobile_money: "MoMo",
    card: "Card",
    cash_on_delivery: "Cash",
  }

  // Fix — use reduce instead of map to avoid mutating offset
  const slices = data.reduce(function(acc, item, i) {
    const pct = (item.count / total) * 100
    const currentOffset = acc.length > 0
      ? acc[acc.length - 1].offset + acc[acc.length - 1].pct
      : 0
    acc.push({ ...item, pct, offset: currentOffset, color: colors[i] })
    return acc
  }, [])

  return (
    <div className="flex items-center gap-6">
      <div className="relative w-32 h-32 flex-shrink-0">
        <svg viewBox="0 0 36 36" className="w-32 h-32 -rotate-90">
          <circle cx="18" cy="18" r="15.9"
            fill="none" stroke="#f3f4f6" strokeWidth="3.5" />
          {slices.map(function(slice) {
            const circumference = 2 * Math.PI * 15.9
            const dash = (slice.pct / 100) * circumference
            const gap = circumference - dash
            return (
              <circle
                key={slice._id}
                cx="18" cy="18" r="15.9"
                fill="none"
                stroke={slice.color}
                strokeWidth="3.5"
                strokeDasharray={dash + " " + gap}
                strokeDashoffset={-(slice.offset / 100) * circumference}
              />
            )
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-extrabold text-gray-800">{total}</p>
            <p className="text-xs text-gray-400">orders</p>
          </div>
        </div>
      </div>
      <div className="space-y-2 flex-1">
        {slices.map(function(slice) {
          return (
            <div key={slice._id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full"
                  style={{ background: slice.color }} />
                <span className="text-sm text-gray-600">
                  {labels[slice._id] || slice._id}
                </span>
              </div>
              <span className="text-sm font-bold text-gray-800">
                {slice.pct.toFixed(1)}%
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function Analytics() {
  const [overview, setOverview] = useState(null)
  const [revenueData, setRevenueData] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [paymentStats, setPaymentStats] = useState([])
  const [regionStats, setRegionStats] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(function() {
    async function fetchAll() {
      setLoading(true)
      try {
        const [overviewRes, revenueRes, productsRes, paymentRes, regionRes] =
          await Promise.all([
            axios.get("/analytics/overview"),
            axios.get("/analytics/revenue"),
            axios.get("/analytics/top-products"),
            axios.get("/analytics/payment-stats"),
            axios.get("/analytics/regions"),
          ])
        setOverview(overviewRes.data.overview)
        setRevenueData(revenueRes.data.data)
        setTopProducts(productsRes.data.products)
        setPaymentStats(paymentRes.data.stats)
        setRegionStats(regionRes.data.stats)
      } catch {
        setOverview(null)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(function(i) {
            return (
              <div key={i} className="bg-white rounded-2xl p-5 h-32 border border-gray-100" />
            )
          })}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 h-64 border border-gray-100" />
          <div className="bg-white rounded-2xl p-6 h-64 border border-gray-100" />
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1D3557]">Analytics</h1>
          <p className="text-gray-500 text-sm mt-1">
            Financial overview and business insights
          </p>
        </div>
        <span className="text-xs bg-green-100 text-green-700 font-bold
                         px-3 py-1.5 rounded-xl">
          🔴 Live Data
        </span>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<FiDollarSign size={20} />}
          label="Total Revenue"
          value={formatGHS(overview?.totalRevenue || 0)}
          growth={overview?.revenueGrowth}
          color="text-green-600"
          bg="bg-green-50"
        />
        <StatCard
          icon={<FiTrendingUp size={20} />}
          label="This Month"
          value={formatGHS(overview?.monthRevenue || 0)}
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <StatCard
          icon={<FiShoppingBag size={20} />}
          label="Total Orders"
          value={overview?.totalOrders || 0}
          color="text-orange-500"
          bg="bg-orange-50"
        />
        <StatCard
          icon={<FiUsers size={20} />}
          label="Total Customers"
          value={overview?.totalUsers || 0}
          color="text-purple-600"
          bg="bg-purple-50"
        />
      </div>

      {/* Order Status Row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Pending", value: overview?.pendingOrders || 0, color: "text-yellow-600", bg: "bg-yellow-50" },
          { label: "Delivered", value: overview?.deliveredOrders || 0, color: "text-green-600", bg: "bg-green-50" },
          { label: "Cancelled", value: overview?.cancelledOrders || 0, color: "text-red-500", bg: "bg-red-50" },
        ].map(function(item) {
          return (
            <div key={item.label}
              className={"rounded-2xl p-4 text-center border " + item.bg}>
              <p className={"text-2xl font-extrabold " + item.color}>{item.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{item.label} Orders</p>
            </div>
          )
        })}
      </div>

      {/* Revenue Chart + Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-extrabold text-[#1D3557]">Revenue Overview</h2>
              <p className="text-xs text-gray-400 mt-0.5">Last 6 months</p>
            </div>
            <div className="text-xs bg-orange-50 text-[#FFA07A] font-bold px-3 py-1 rounded-xl">
              GHS
            </div>
          </div>
          {revenueData.length > 0 ? (
            <BarChart data={revenueData} />
          ) : (
            <div className="h-40 flex items-center justify-center text-gray-400">
              <p>No revenue data yet</p>
            </div>
          )}
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-extrabold text-[#1D3557] mb-2">Payment Methods</h2>
          <p className="text-xs text-gray-400 mb-5">Order distribution</p>
          {paymentStats.length > 0 ? (
            <DonutChart data={paymentStats} />
          ) : (
            <div className="h-40 flex items-center justify-center text-gray-400">
              <p>No data yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Top Products + Regions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top Products */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b">
            <h2 className="font-extrabold text-[#1D3557]">Top Selling Products</h2>
            <p className="text-xs text-gray-400 mt-0.5">By units sold</p>
          </div>
          {topProducts.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <FiPackage size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No sales data yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {topProducts.map(function(product, i) {
                return (
                  <div key={product._id}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition">
                    <span className={"w-7 h-7 rounded-xl flex items-center justify-center text-xs font-extrabold " +
                      (i === 0 ? "bg-yellow-100 text-yellow-700" :
                       i === 1 ? "bg-gray-100 text-gray-600" :
                       i === 2 ? "bg-orange-100 text-orange-600" :
                       "bg-gray-50 text-gray-400")}>
                      {i + 1}
                    </span>
                    {product.image ? (
                      <img src={product.image} alt={product.name}
                        className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 line-clamp-1">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {product.totalSold} units sold
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-[#1D3557]">
                        {formatGHS(product.totalRevenue)}
                      </p>
                      <p className="text-xs text-gray-400">revenue</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Orders by Region */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b">
            <h2 className="font-extrabold text-[#1D3557]">Orders by Region</h2>
            <p className="text-xs text-gray-400 mt-0.5">Top 10 regions in Ghana</p>
          </div>
          {regionStats.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <FiPackage size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No regional data yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {regionStats.map(function(region, i) {
                const maxOrders = regionStats[0]?.orders || 1
                const pct = Math.round((region.orders / maxOrders) * 100)
                return (
                  <div key={region._id} className="px-6 py-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 w-5">{i + 1}</span>
                        <span className="text-sm font-semibold text-gray-700">
                          {region._id || "Unknown"}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-gray-800">
                          {region.orders} orders
                        </span>
                        <span className="text-xs text-gray-400 ml-2">
                          {formatGHS(region.revenue)}
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#FFA07A] to-orange-300
                                   rounded-full transition-all duration-500"
                        style={{ width: pct + "%" }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}