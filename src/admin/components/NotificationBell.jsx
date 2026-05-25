import { useState, useEffect, useRef, useCallback } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import {
  FiBell, FiX, FiCheck, FiTrash2,
  FiShoppingBag, FiAlertTriangle,
  FiUsers, FiCreditCard
} from "react-icons/fi"

const TYPE_STYLES = {
  new_order: {
    color:   "text-blue-600",
    bg:      "bg-blue-50",
    getIcon: function() { return <FiShoppingBag size={16} /> },
  },
  low_stock: {
    color:   "text-yellow-600",
    bg:      "bg-yellow-50",
    getIcon: function() { return <FiAlertTriangle size={16} /> },
  },
  new_user: {
    color:   "text-green-600",
    bg:      "bg-green-50",
    getIcon: function() { return <FiUsers size={16} /> },
  },
  payment: {
    color:   "text-purple-600",
    bg:      "bg-purple-50",
    getIcon: function() { return <FiCreditCard size={16} /> },
  },
}

function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000)
  if (seconds < 60)    return "just now"
  if (seconds < 3600)  return Math.floor(seconds / 60) + "m ago"
  if (seconds < 86400) return Math.floor(seconds / 3600) + "h ago"
  return Math.floor(seconds / 86400) + "d ago"
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([])
  const [unreadCount,   setUnreadCount]   = useState(0)
  const [open,          setOpen]          = useState(false)
  const [loading,       setLoading]       = useState(false)
  const dropdownRef  = useRef(null)
  const prevCountRef = useRef(0)

  // ✅ Fix 1 — playSound declared FIRST
  function playSound() {
    try {
      const ctx  = new (window.AudioContext || window.webkitAudioContext)()
      const osc  = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.setValueAtTime(880, ctx.currentTime)
      osc.frequency.setValueAtTime(660, ctx.currentTime + 0.1)
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.4)
    } catch (err) {
      void err
    }
  }

  const fetchNotifications = useCallback(async function() {
    try {
      const { data } = await axios.get("/notifications")
      setNotifications(data.notifications || [])
      if (data.unreadCount > prevCountRef.current &&
          prevCountRef.current >= 0) {
        playSound()
      }
      prevCountRef.current = data.unreadCount
      setUnreadCount(data.unreadCount || 0)
    } catch (err) {
      void err
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(function() {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return function() { clearInterval(interval) }
  }, [fetchNotifications])

  // ✅ Fix 2 — close on outside click
  useEffect(function() {
    function handleClick(e) {
      if (dropdownRef.current &&
          !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return function() {
      document.removeEventListener("mousedown", handleClick)
    }
  }, [])

  async function handleMarkAllRead() {
    setLoading(true)
    try {
      await axios.put("/notifications/mark-all-read")
      setNotifications(function(prev) {
        return prev.map(function(n) { return { ...n, isRead: true } })
      })
      setUnreadCount(0)
      prevCountRef.current = 0
    } catch (err) { void err }
    setLoading(false)
  }

  async function handleMarkOne(notifId) {
    try {
      await axios.put("/notifications/" + notifId + "/read")
      setNotifications(function(prev) {
        return prev.map(function(n) {
          return n._id === notifId ? { ...n, isRead: true } : n
        })
      })
      setUnreadCount(function(prev) { return Math.max(0, prev - 1) })
    } catch (err) { void err }
  }

  async function handleClearAll() {
    if (!window.confirm("Clear all notifications?")) return
    setLoading(true)
    try {
      await axios.delete("/notifications/clear")
      setNotifications([])
      setUnreadCount(0)
      prevCountRef.current = 0
    } catch (err) { void err }  // ✅ Fix 3 — was empty catch {}
    setLoading(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>

      {/* Bell button */}
      <button
        onClick={function() {
          setOpen(function(o) { return !o })
          if (!open && unreadCount > 0) handleMarkAllRead()
        }}
        className="relative p-2 text-gray-500 hover:text-[#FF4500]
                   hover:bg-orange-50 rounded-xl transition"
      >
        <FiBell size={22} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-[#FF4500]
                           text-white text-xs rounded-full min-w-[18px]
                           h-[18px] flex items-center justify-center
                           font-bold px-1 animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl
                        shadow-2xl border border-gray-100 z-50 overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3
                          border-b border-gray-100 bg-gray-50">
            <div className="flex items-center gap-2">
              <FiBell size={16} className="text-[#FF4500]" />
              <h3 className="font-bold text-gray-800 text-sm">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="bg-[#FF4500] text-white text-xs
                                 font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {notifications.length > 0 && (
                <>
                  <button
                    onClick={handleMarkAllRead}
                    disabled={loading || unreadCount === 0}
                    title="Mark all read"
                    className="p-1.5 text-gray-400 hover:text-green-600
                               hover:bg-green-50 rounded-lg transition
                               disabled:opacity-40"
                  >
                    <FiCheck size={14} />
                  </button>
                  <button
                    onClick={handleClearAll}
                    disabled={loading}
                    title="Clear all"
                    className="p-1.5 text-gray-400 hover:text-red-500
                               hover:bg-red-50 rounded-lg transition
                               disabled:opacity-40"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </>
              )}
              <button
                onClick={function() { setOpen(false) }}
                className="p-1.5 text-gray-400 hover:text-gray-600
                           hover:bg-gray-100 rounded-lg transition"
              >
                <FiX size={14} />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <FiBell size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">No notifications yet</p>
                <p className="text-xs mt-1">New orders will appear here</p>
              </div>
            ) : (
              notifications.map(function(notif) {
                const style = TYPE_STYLES[notif.type] || TYPE_STYLES.new_order
                return (
                  <div
                    key={notif._id}
                    onClick={function() {
                      if (!notif.isRead) handleMarkOne(notif._id)
                    }}
                    className={"flex gap-3 px-4 py-3 border-b border-gray-50 " +
                      "hover:bg-gray-50 transition cursor-pointer " +
                      (notif.isRead ? "opacity-70" : "bg-orange-50/30")}
                  >
                    <div className={"w-9 h-9 rounded-xl flex items-center " +
                      "justify-center flex-shrink-0 " +
                      style.bg + " " + style.color}>
                      {style.getIcon()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={"text-sm font-semibold " +
                          (notif.isRead ? "text-gray-600" : "text-gray-800")}>
                          {notif.title}
                        </p>
                        {!notif.isRead && (
                          <div className="w-2 h-2 rounded-full bg-[#FF4500]
                                          flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                        {notif.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {timeAgo(notif.createdAt)}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
              <Link
                to="/admin/orders"
                onClick={function() { setOpen(false) }}
                className="block text-center text-xs font-bold
                           text-[#FF4500] hover:underline"
              >
                View All Orders →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}