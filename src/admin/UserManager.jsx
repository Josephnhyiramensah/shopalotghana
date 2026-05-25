import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import toast from "react-hot-toast"
import { useAuth } from "../hooks/useAuth"
import {
  FiSearch, FiEye, FiX, FiUsers,
  FiUserX, FiUserCheck, FiTrash2,
  FiMail, FiPhone, FiCalendar,
  FiShoppingBag, FiShield
} from "react-icons/fi"
import { formatGHS } from "../utils/formatCurrency"

const ROLE_STYLES = {
  user:       "bg-gray-100 text-gray-600",
  staff:      "bg-green-100 text-green-700",
  admin:      "bg-blue-100 text-blue-700",
  superadmin: "bg-purple-100 text-purple-700",
}

export default function UserManager() {
  const { user: currentUser } = useAuth()
  const isSuperAdmin = currentUser?.role === "superadmin"

  const [users,         setUsers]         = useState([])
  const [loading,       setLoading]       = useState(true)
  const [search,        setSearch]        = useState("")
  const [page,          setPage]          = useState(1)
  const [totalPages,    setTotalPages]    = useState(1)
  const [total,         setTotal]         = useState(0)
  const [selectedUser,  setSelectedUser]  = useState(null)
  const [userOrders,    setUserOrders]    = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(null)
  const [showBanModal,  setShowBanModal]  = useState(null)
  const [banReason,     setBanReason]     = useState("")

  // Promote modal
  const [showPromoteModal, setShowPromoteModal] = useState(null)
  const [selectedRole,     setSelectedRole]     = useState("")

  const fetchUsers = useCallback(async function() {
    setLoading(true)
    try {
      let url = "/users?page=" + page + "&limit=10"
      if (search) url += "&keyword=" + search
      const { data } = await axios.get(url)
      setUsers(data.users || [])
      setTotalPages(data.pages || 1)
      setTotal(data.total || 0)
    } catch {
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(function() {
    fetchUsers()
  }, [fetchUsers])

  async function viewUser(user) {
    setSelectedUser(user)
    setOrdersLoading(true)
    try {
      const { data } = await axios.get("/users/" + user._id + "/orders")
      setUserOrders(data.orders || [])
    } catch {
      setUserOrders([])
    } finally {
      setOrdersLoading(false)
    }
  }

  async function handleBan(userId) {
    setActionLoading(userId)
    try {
      await axios.put("/users/" + userId + "/ban", { reason: banReason })
      toast.success("User banned successfully")
      setShowBanModal(null)
      setBanReason("")
      fetchUsers()
      if (selectedUser?._id === userId) {
        setSelectedUser(function(prev) {
          return { ...prev, isBanned: true, bannedReason: banReason }
        })
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to ban user")
    } finally {
      setActionLoading(null)
    }
  }

  async function handleUnban(userId) {
    setActionLoading(userId)
    try {
      await axios.put("/users/" + userId + "/unban")
      toast.success("User unbanned")
      fetchUsers()
      if (selectedUser?._id === userId) {
        setSelectedUser(function(prev) {
          return { ...prev, isBanned: false }
        })
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to unban user")
    } finally {
      setActionLoading(null)
    }
  }

  async function handleDelete(userId) {
    if (!window.confirm("Are you sure? This cannot be undone.")) return
    setActionLoading(userId)
    try {
      await axios.delete("/users/" + userId)
      toast.success("User deleted")
      setSelectedUser(null)
      fetchUsers()
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete user")
    } finally {
      setActionLoading(null)
    }
  }

  // ✅ Promote / demote role
  async function handlePromote() {
    if (!selectedRole || !showPromoteModal) return
    setActionLoading(showPromoteModal._id)
    try {
      await axios.put("/users/" + showPromoteModal._id + "/promote",
        { role: selectedRole }
      )
      toast.success(showPromoteModal.name + " is now " + selectedRole)
      setShowPromoteModal(null)
      setSelectedRole("")
      fetchUsers()
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update role")
    } finally {
      setActionLoading(null)
    }
  }

  function openPromoteModal(user) {
    setShowPromoteModal(user)
    setSelectedRole(user.role || "user")
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1D3557]">
            User Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {total} registered customers
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100
                      p-4 mb-6">
        <div className="relative max-w-md">
          <FiSearch size={16} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={function(e) {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Search by name or email..."
            className="w-full border border-gray-200 rounded-xl pl-9 pr-4
                       py-2.5 text-sm outline-none focus:border-[#FF4500]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100
                      overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1,2,3,4,5].map(function(i) {
              return (
                <div key={i} className="animate-pulse flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                  <div className="h-8 bg-gray-200 rounded-xl w-20" />
                </div>
              )
            })}
          </div>
        ) : users.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            <FiUsers size={48} className="mx-auto mb-4 opacity-30" />
            <p className="font-medium text-lg">No users found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="text-left px-6 py-3">User</th>
                    <th className="text-left px-6 py-3">Phone</th>
                    <th className="text-left px-6 py-3">Role</th>
                    <th className="text-left px-6 py-3">Joined</th>
                    <th className="text-left px-6 py-3">Status</th>
                    <th className="text-left px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map(function(user) {
                    return (
                      <tr key={user._id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={"w-10 h-10 rounded-full flex items-center " +
                              "justify-center font-bold text-sm flex-shrink-0 " +
                              (user.isBanned
                                ? "bg-red-100 text-red-500"
                                : "bg-[#FF4500] text-white")}>
                              {user.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">
                                {user.name}
                              </p>
                              <p className="text-xs text-gray-400">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-xs">
                          {user.phone || "—"}
                        </td>
                        <td className="px-6 py-4">
                          <span className={"text-xs font-bold px-2.5 py-1 " +
                            "rounded-lg capitalize " +
                            (ROLE_STYLES[user.role] || ROLE_STYLES.user)}>
                            {user.role || "user"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-400 text-xs">
                          {new Date(user.createdAt).toLocaleDateString("en-GH", {
                            day: "numeric", month: "short", year: "numeric"
                          })}
                        </td>
                        <td className="px-6 py-4">
                          {user.isBanned ? (
                            <span className="bg-red-100 text-red-600 text-xs
                                             font-bold px-2.5 py-1 rounded-lg">
                              Banned
                            </span>
                          ) : (
                            <span className="bg-green-100 text-green-700 text-xs
                                             font-bold px-2.5 py-1 rounded-lg">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {/* View */}
                            <button
                              onClick={function() { viewUser(user) }}
                              className="p-2 rounded-xl bg-blue-50 text-blue-600
                                         hover:bg-blue-100 transition"
                              title="View Details"
                            >
                              <FiEye size={14} />
                            </button>

                            {/* ✅ Promote role */}
                            <button
                              onClick={function() { openPromoteModal(user) }}
                              className="p-2 rounded-xl bg-purple-50 text-purple-600
                                         hover:bg-purple-100 transition"
                              title="Change Role"
                            >
                              <FiShield size={14} />
                            </button>

                            {/* Ban / Unban */}
                            {user.isBanned ? (
                              <button
                                onClick={function() { handleUnban(user._id) }}
                                disabled={actionLoading === user._id}
                                className="p-2 rounded-xl bg-green-50 text-green-600
                                           hover:bg-green-100 transition
                                           disabled:opacity-50"
                                title="Unban User"
                              >
                                <FiUserCheck size={14} />
                              </button>
                            ) : (
                              <button
                                onClick={function() { setShowBanModal(user) }}
                                disabled={actionLoading === user._id}
                                className="p-2 rounded-xl bg-orange-50 text-orange-500
                                           hover:bg-orange-100 transition
                                           disabled:opacity-50"
                                title="Ban User"
                              >
                                <FiUserX size={14} />
                              </button>
                            )}

                            {/* Delete */}
                            <button
                              onClick={function() { handleDelete(user._id) }}
                              disabled={actionLoading === user._id}
                              className="p-2 rounded-xl bg-red-50 text-red-500
                                         hover:bg-red-100 transition disabled:opacity-50"
                              title="Delete User"
                            >
                              <FiTrash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 px-6
                              py-4 border-t">
                {Array.from({ length: totalPages }, function(_, i) {
                  return (
                    <button
                      key={i + 1}
                      onClick={function() { setPage(i + 1) }}
                      className={"w-9 h-9 rounded-xl text-sm font-bold transition " +
                        (page === i + 1
                          ? "bg-[#FF4500] text-white"
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

      {/* ✅ Promote Role Modal */}
      {showPromoteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center
                        justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b">
              <div>
                <h2 className="font-extrabold text-[#1D3557]">Change Role</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {showPromoteModal.name}
                </p>
              </div>
              <button
                onClick={function() {
                  setShowPromoteModal(null)
                  setSelectedRole("")
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-500 mb-4">
                Select a role for this user. Roles control what they can
                access in the admin panel.
              </p>

              <div className="space-y-3 mb-6">
                {/* Customer */}
                <label className={"flex items-start gap-3 p-4 rounded-xl border-2 " +
                  "cursor-pointer transition " +
                  (selectedRole === "user"
                    ? "border-gray-400 bg-gray-50"
                    : "border-gray-100 hover:border-gray-200")}>
                  <input
                    type="radio"
                    name="role"
                    value="user"
                    checked={selectedRole === "user"}
                    onChange={function() { setSelectedRole("user") }}
                    className="mt-0.5"
                  />
                  <div>
                    <p className="font-bold text-gray-700 text-sm">
                      👤 Customer
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Regular customer — no admin access
                    </p>
                  </div>
                </label>

                {/* Staff */}
                <label className={"flex items-start gap-3 p-4 rounded-xl border-2 " +
                  "cursor-pointer transition " +
                  (selectedRole === "staff"
                    ? "border-green-400 bg-green-50"
                    : "border-gray-100 hover:border-gray-200")}>
                  <input
                    type="radio"
                    name="role"
                    value="staff"
                    checked={selectedRole === "staff"}
                    onChange={function() { setSelectedRole("staff") }}
                    className="mt-0.5"
                  />
                  <div>
                    <p className="font-bold text-green-700 text-sm">
                      🧑‍💼 Staff
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Can view and manage products and orders
                    </p>
                  </div>
                </label>

                {/* Admin */}
                <label className={"flex items-start gap-3 p-4 rounded-xl border-2 " +
                  "cursor-pointer transition " +
                  (selectedRole === "admin"
                    ? "border-blue-400 bg-blue-50"
                    : "border-gray-100 hover:border-gray-200")}>
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={selectedRole === "admin"}
                    onChange={function() { setSelectedRole("admin") }}
                    className="mt-0.5"
                  />
                  <div>
                    <p className="font-bold text-blue-700 text-sm">
                      🔑 Admin
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Full access — manage users, orders, products and settings
                    </p>
                  </div>
                </label>

                {/* Superadmin — only visible to superadmin */}
                {isSuperAdmin && (
                  <label className={"flex items-start gap-3 p-4 rounded-xl border-2 " +
                    "cursor-pointer transition " +
                    (selectedRole === "superadmin"
                      ? "border-purple-400 bg-purple-50"
                      : "border-gray-100 hover:border-gray-200")}>
                    <input
                      type="radio"
                      name="role"
                      value="superadmin"
                      checked={selectedRole === "superadmin"}
                      onChange={function() { setSelectedRole("superadmin") }}
                      className="mt-0.5"
                    />
                    <div>
                      <p className="font-bold text-purple-700 text-sm">
                        👑 Super Admin
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Highest level — can manage admins and audit logs
                      </p>
                    </div>
                  </label>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={function() {
                    setShowPromoteModal(null)
                    setSelectedRole("")
                  }}
                  className="flex-1 border-2 border-gray-200 text-gray-700
                             font-bold py-3 rounded-xl hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePromote}
                  disabled={actionLoading === showPromoteModal._id ||
                    selectedRole === showPromoteModal.role}
                  className="flex-1 bg-[#1D3557] hover:bg-blue-900 text-white
                             font-bold py-3 rounded-xl transition
                             disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {actionLoading === showPromoteModal._id
                    ? "Saving..."
                    : "Save Role"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ban Modal */}
      {showBanModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center
                        justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b">
              <h2 className="font-extrabold text-[#1D3557]">Ban User</h2>
              <button
                onClick={function() { setShowBanModal(null) }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Banning{" "}
                <span className="font-bold text-gray-800">
                  {showBanModal.name}
                </span>
                . Please provide a reason:
              </p>
              <textarea
                value={banReason}
                onChange={function(e) { setBanReason(e.target.value) }}
                placeholder="Reason for ban..."
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-3
                           text-sm outline-none focus:border-[#FF4500]
                           resize-none mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={function() { setShowBanModal(null) }}
                  className="flex-1 border-2 border-gray-200 text-gray-700
                             font-bold py-3 rounded-xl hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={function() { handleBan(showBanModal._id) }}
                  disabled={actionLoading === showBanModal._id}
                  className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-300
                             text-white font-bold py-3 rounded-xl transition"
                >
                  {actionLoading === showBanModal._id ? "Banning..." : "Ban User"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center
                        justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl my-4">
            <div className="flex items-center justify-between px-6 py-5 border-b">
              <h2 className="font-extrabold text-[#1D3557]">User Details</h2>
              <button
                onClick={function() { setSelectedUser(null) }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">

              {/* User info */}
              <div className="flex items-center gap-4">
                <div className={"w-16 h-16 rounded-2xl flex items-center " +
                  "justify-center font-extrabold text-2xl " +
                  (selectedUser.isBanned
                    ? "bg-red-100 text-red-500"
                    : "bg-[#FF4500] text-white")}>
                  {selectedUser.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xl font-extrabold text-[#1D3557]">
                    {selectedUser.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={"text-xs font-bold px-2.5 py-1 rounded-lg " +
                      (selectedUser.isBanned
                        ? "bg-red-100 text-red-600"
                        : "bg-green-100 text-green-700")}>
                      {selectedUser.isBanned ? "Banned" : "Active"}
                    </span>
                    <span className={"text-xs font-bold px-2.5 py-1 rounded-lg " +
                      "capitalize " +
                      (ROLE_STYLES[selectedUser.role] || ROLE_STYLES.user)}>
                      {selectedUser.role || "user"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <FiMail size={15} className="text-gray-400" />
                  <span className="text-gray-700">{selectedUser.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <FiPhone size={15} className="text-gray-400" />
                  <span className="text-gray-700">
                    {selectedUser.phone || "Not provided"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <FiCalendar size={15} className="text-gray-400" />
                  <span className="text-gray-700">
                    Joined {new Date(selectedUser.createdAt)
                      .toLocaleDateString("en-GH", {
                        day: "numeric", month: "long", year: "numeric"
                      })}
                  </span>
                </div>
              </div>

              {/* Ban reason */}
              {selectedUser.isBanned && selectedUser.bannedReason && (
                <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                  <p className="text-xs font-bold text-red-600 mb-1">
                    Ban Reason:
                  </p>
                  <p className="text-sm text-red-700">{selectedUser.bannedReason}</p>
                </div>
              )}

              {/* Orders */}
              <div>
                <p className="font-bold text-gray-700 text-sm mb-3
                               flex items-center gap-2">
                  <FiShoppingBag size={15} className="text-[#FF4500]" />
                  Order History ({userOrders.length})
                </p>
                {ordersLoading ? (
                  <div className="space-y-2">
                    {[1,2,3].map(function(i) {
                      return (
                        <div key={i}
                          className="h-12 bg-gray-100 rounded-xl animate-pulse" />
                      )
                    })}
                  </div>
                ) : userOrders.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">
                    No orders yet
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {userOrders.map(function(order) {
                      return (
                        <div key={order._id}
                          className="flex items-center justify-between bg-gray-50
                                     rounded-xl px-4 py-3 border border-gray-100">
                          <div>
                            <p className="text-xs font-mono font-bold text-gray-500">
                              #{order._id.slice(-6).toUpperCase()}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(order.createdAt)
                                .toLocaleDateString("en-GH")}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-[#1D3557]">
                              {formatGHS(order.totalPrice)}
                            </p>
                            <span className={"text-xs font-semibold capitalize " +
                              "px-2 py-0.5 rounded-lg " +
                              (order.status === "delivered"
                                ? "bg-green-100 text-green-700"
                                : order.status === "cancelled"
                                ? "bg-red-100 text-red-600"
                                : "bg-yellow-100 text-yellow-700")}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Modal actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={function() {
                    setSelectedUser(null)
                    openPromoteModal(selectedUser)
                  }}
                  className="flex-1 bg-purple-500 hover:bg-purple-600 text-white
                             font-bold py-3 rounded-xl transition
                             flex items-center justify-center gap-2"
                >
                  <FiShield size={16} /> Change Role
                </button>
                {selectedUser.isBanned ? (
                  <button
                    onClick={function() { handleUnban(selectedUser._id) }}
                    disabled={actionLoading === selectedUser._id}
                    className="flex-1 bg-green-500 hover:bg-green-600
                               disabled:bg-gray-300 text-white font-bold py-3
                               rounded-xl transition flex items-center
                               justify-center gap-2"
                  >
                    <FiUserCheck size={16} /> Unban
                  </button>
                ) : (
                  <button
                    onClick={function() {
                      setSelectedUser(null)
                      setShowBanModal(selectedUser)
                    }}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white
                               font-bold py-3 rounded-xl transition
                               flex items-center justify-center gap-2"
                  >
                    <FiUserX size={16} /> Ban
                  </button>
                )}
                <button
                  onClick={function() { handleDelete(selectedUser._id) }}
                  disabled={actionLoading === selectedUser._id}
                  className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-300
                             text-white font-bold py-3 rounded-xl transition
                             flex items-center justify-center gap-2"
                >
                  <FiTrash2 size={16} /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}