import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import {
  FiActivity, FiTrash2,
  FiShoppingBag, FiUsers, FiTag,
  FiSettings, FiDownload, FiShield,
  FiRefreshCw, FiX
} from "react-icons/fi"

const CATEGORIES = ["all", "product", "order", "user", "coupon", "settings", "auth", "export"]

const categoryIcons = {
  product: <FiShoppingBag size={14} />,
  order: <FiActivity size={14} />,
  user: <FiUsers size={14} />,
  coupon: <FiTag size={14} />,
  settings: <FiSettings size={14} />,
  auth: <FiShield size={14} />,
  export: <FiDownload size={14} />,
}

const categoryColors = {
  product: "bg-blue-100 text-blue-700",
  order: "bg-purple-100 text-purple-700",
  user: "bg-orange-100 text-orange-700",
  coupon: "bg-green-100 text-green-700",
  settings: "bg-gray-100 text-gray-600",
  auth: "bg-red-100 text-red-600",
  export: "bg-teal-100 text-teal-700",
}

const statusColors = {
  success: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-600",
}

export default function AuditLog() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [filterCategory, setFilterCategory] = useState("all")
  const [selectedLog, setSelectedLog] = useState(null)
  const [clearing, setClearing] = useState(false)

  const fetchLogs = useCallback(async function() {
    setLoading(true)
    try {
      let url = "/audit?page=" + page + "&limit=15"
      if (filterCategory !== "all") url += "&category=" + filterCategory
      const { data } = await axios.get(url)
      setLogs(data.logs || [])
      setTotalPages(data.pages || 1)
      setTotal(data.total || 0)
    } catch {
      setLogs([])
    } finally {
      setLoading(false)
    }
  }, [page, filterCategory])

  useEffect(function() {
    fetchLogs()
  }, [fetchLogs])

  async function handleClear() {
    if (!window.confirm(
      "Are you sure you want to clear ALL audit logs? This cannot be undone."
    )) return
    setClearing(true)
    try {
      await axios.delete("/audit")
      setLogs([])
      setTotal(0)
    } catch {
      // ignore
    } finally {
      setClearing(false)
    }
  }

  function formatTime(date) {
    return new Date(date).toLocaleString("en-GH", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1D3557]">Audit Log</h1>
          <p className="text-gray-500 text-sm mt-1">
            {total} admin actions recorded
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchLogs}
            className="flex items-center gap-2 border-2 border-gray-200
                       hover:border-gray-300 text-gray-600 font-semibold
                       px-4 py-2.5 rounded-xl transition text-sm"
          >
            <FiRefreshCw size={15} /> Refresh
          </button>
          <button
            onClick={handleClear}
            disabled={clearing || logs.length === 0}
            className="flex items-center gap-2 bg-red-50 hover:bg-red-100
                       disabled:opacity-50 text-red-500 font-semibold
                       px-4 py-2.5 rounded-xl transition text-sm"
          >
            <FiTrash2 size={15} />
            {clearing ? "Clearing..." : "Clear All"}
          </button>
        </div>
      </div>

      {/* Category filter */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(function(cat) {
            return (
              <button
                key={cat}
                onClick={function() {
                  setFilterCategory(cat)
                  setPage(1)
                }}
                className={"px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition " +
                  (filterCategory === cat
                    ? "bg-[#FFA07A] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200")}
              >
                {cat}
              </button>
            )
          })}
        </div>
      </div>

      {/* Logs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5].map(function(i) {
              return (
                <div key={i} className="animate-pulse flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                  </div>
                  <div className="h-6 bg-gray-200 rounded-xl w-20" />
                </div>
              )
            })}
          </div>
        ) : logs.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            <FiActivity size={48} className="mx-auto mb-4 opacity-30" />
            <p className="font-medium text-lg">No audit logs yet</p>
            <p className="text-sm">Admin actions will appear here</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-50">
              {logs.map(function(log) {
                return (
                  <div
                    key={log._id}
                    onClick={function() { setSelectedLog(log) }}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50
                               transition cursor-pointer"
                  >
                    {/* Category icon */}
                    <div className={"w-10 h-10 rounded-xl flex items-center justify-center " +
                      "flex-shrink-0 " +
                      (categoryColors[log.category] || "bg-gray-100 text-gray-600")}>
                      {categoryIcons[log.category] || <FiActivity size={14} />}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 line-clamp-1">
                        {log.action}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-400">{log.adminName}</span>
                        <span className="text-gray-300">•</span>
                        <span className="text-xs text-gray-400">
                          {formatTime(log.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={"text-xs font-bold px-2.5 py-1 rounded-xl capitalize " +
                        (categoryColors[log.category] || "bg-gray-100 text-gray-600")}>
                        {log.category}
                      </span>
                      <span className={"text-xs font-bold px-2.5 py-1 rounded-xl " +
                        (statusColors[log.status] || "bg-gray-100 text-gray-600")}>
                        {log.status}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 px-6 py-4 border-t">
                {Array.from({ length: totalPages }, function(_, i) {
                  return (
                    <button
                      key={i + 1}
                      onClick={function() { setPage(i + 1) }}
                      className={"w-9 h-9 rounded-xl text-sm font-bold transition " +
                        (page === i + 1
                          ? "bg-[#FFA07A] text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200")}
                    >
                      {i + 1}
                    </button>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center
                        justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">

            <div className="flex items-center justify-between px-6 py-5 border-b">
              <h2 className="font-extrabold text-[#1D3557]">Log Details</h2>
              <button
                onClick={function() { setSelectedLog(null) }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">

              {/* Action */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Action</p>
                <p className="font-semibold text-gray-800">{selectedLog.action}</p>
              </div>

              {/* Admin */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">
                    Admin
                  </p>
                  <p className="font-semibold text-gray-800 text-sm">
                    {selectedLog.adminName}
                  </p>
                  <p className="text-xs text-gray-400">{selectedLog.adminEmail}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">
                    Category
                  </p>
                  <span className={"text-xs font-bold px-2.5 py-1 rounded-xl capitalize " +
                    (categoryColors[selectedLog.category] || "bg-gray-100 text-gray-600")}>
                    {selectedLog.category}
                  </span>
                </div>
              </div>

              {/* Status + IP */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">
                    Status
                  </p>
                  <span className={"text-xs font-bold px-2.5 py-1 rounded-xl " +
                    (statusColors[selectedLog.status] || "bg-gray-100")}>
                    {selectedLog.status}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">
                    IP Address
                  </p>
                  <p className="text-sm font-mono text-gray-600">
                    {selectedLog.ipAddress || "—"}
                  </p>
                </div>
              </div>

              {/* Details */}
              {selectedLog.details && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">
                    Details
                  </p>
                  <p className="text-xs font-mono text-gray-600 break-all">
                    {selectedLog.details}
                  </p>
                </div>
              )}

              {/* Time */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">
                  Timestamp
                </p>
                <p className="text-sm text-gray-700">
                  {formatTime(selectedLog.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}