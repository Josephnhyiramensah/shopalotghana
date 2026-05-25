import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import toast from "react-hot-toast"
import {
  FiPlus, FiEdit2, FiTrash2, FiX,
  FiShield, FiUser, FiCheck, FiSearch
} from "react-icons/fi"

const ROLES = ["staff", "admin"]

const PERMISSIONS = [
  { key: "manageProducts", label: "Manage Products", desc: "Add, edit, delete products" },
  { key: "manageOrders", label: "Manage Orders", desc: "View and update order status" },
  { key: "manageCoupons", label: "Manage Coupons", desc: "Create and delete coupons" },
  { key: "viewFinancials", label: "View Financials", desc: "Access analytics and reports" },
  { key: "manageUsers", label: "Manage Users", desc: "Ban, unban, delete users" },
  { key: "exportData", label: "Export Data", desc: "Download reports as CSV" },
]

const roleColors = {
  superadmin: "bg-purple-100 text-purple-700",
  admin: "bg-blue-100 text-blue-700",
  staff: "bg-gray-100 text-gray-600",
}

const emptyPermissions = {
  manageProducts: false,
  manageOrders: false,
  manageCoupons: false,
  viewFinancials: false,
  manageUsers: false,
  exportData: false,
}

export default function AdminManager() {
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editAdmin, setEditAdmin] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [selectedRole, setSelectedRole] = useState("staff")
  const [permissions, setPermissions] = useState(emptyPermissions)
  const [searchEmail, setSearchEmail] = useState("")
  const [foundUser, setFoundUser] = useState(null)
  const [searching, setSearching] = useState(false)

  const fetchAdmins = useCallback(async function() {
    setLoading(true)
    try {
      const { data } = await axios.get("/users/admins")
      setAdmins(data.admins || [])
    } catch {
      setAdmins([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(function() {
    fetchAdmins()
  }, [fetchAdmins])

  function openEdit(admin) {
    setEditAdmin(admin)
    setSelectedRole(admin.role)
    setPermissions(admin.permissions || emptyPermissions)
    setFoundUser(null)
    setSearchEmail("")
    setShowModal(true)
  }

  function openAdd() {
    setEditAdmin(null)
    setSelectedRole("staff")
    setPermissions(emptyPermissions)
    setFoundUser(null)
    setSearchEmail("")
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditAdmin(null)
    setFoundUser(null)
    setSearchEmail("")
    setSelectedRole("staff")
    setPermissions(emptyPermissions)
  }

  function togglePermission(key) {
    setPermissions(function(prev) {
      return { ...prev, [key]: !prev[key] }
    })
  }

  function setAllPermissions(value) {
    const all = {}
    PERMISSIONS.forEach(function(p) { all[p.key] = value })
    setPermissions(all)
  }

  async function searchUser() {
    if (!searchEmail.trim()) {
      toast.error("Enter an email to search")
      return
    }
    setSearching(true)
    try {
      const { data } = await axios.get("/users?keyword=" + searchEmail)
      const user = data.users?.[0]
      if (!user) {
        toast.error("No user found with that email")
        setFoundUser(null)
      } else {
        setFoundUser(user)
        toast.success("User found: " + user.name)
      }
    } catch {
      toast.error("Search failed")
    } finally {
      setSearching(false)
    }
  }

  async function handleSave() {
    if (!editAdmin && !foundUser) {
      toast.error("Please search and select a user first")
      return
    }
    setSaving(true)
    try {
      const userId = editAdmin ? editAdmin._id : foundUser._id
      await axios.put("/users/" + userId + "/promote", {
        role: selectedRole,
        permissions: selectedRole === "admin" ? {} : permissions,
      })
      toast.success(editAdmin ? "Admin updated!" : "User promoted!")
      closeModal()
      fetchAdmins()
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  async function handleRemove(adminId) {
    if (!window.confirm("Remove this admin? They will become a regular user.")) return
    setDeleting(adminId)
    try {
      await axios.put("/users/" + adminId + "/promote", {
        role: "user",
        permissions: emptyPermissions,
      })
      toast.success("Admin removed")
      fetchAdmins()
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove admin")
    } finally {
      setDeleting(null)
    }
  }

  const filteredAdmins = admins.filter(function(a) {
    if (!search) return true
    return a.name.toLowerCase().includes(search.toLowerCase()) ||
           a.email.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1D3557]">Admin Manager</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage staff, admins and their permissions
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-[#FFA07A] hover:bg-orange-500
                     text-white font-bold px-5 py-2.5 rounded-xl transition"
        >
          <FiPlus size={18} /> Add Admin
        </button>
      </div>

      {/* Role summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { role: "superadmin", label: "Super Admin", color: "bg-purple-50 border-purple-200" },
          { role: "admin", label: "Admin", color: "bg-blue-50 border-blue-200" },
          { role: "staff", label: "Staff", color: "bg-gray-50 border-gray-200" },
        ].map(function(item) {
          const count = admins.filter(function(a) { return a.role === item.role }).length
          return (
            <div key={item.role}
              className={"rounded-2xl p-4 border-2 text-center " + item.color}>
              <p className="text-2xl font-extrabold text-gray-800">{count}</p>
              <p className="text-sm text-gray-500 mt-0.5">{item.label}</p>
            </div>
          )
        })}
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="relative max-w-md">
          <FiSearch size={16} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={function(e) { setSearch(e.target.value) }}
            placeholder="Search admins..."
            className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5
                       text-sm outline-none focus:border-[#FFA07A] transition"
          />
        </div>
      </div>

      {/* Admins list */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map(function(i) {
              return (
                <div key={i} className="animate-pulse flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-2xl flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                  <div className="h-8 bg-gray-200 rounded-xl w-24" />
                </div>
              )
            })}
          </div>
        ) : filteredAdmins.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            <FiShield size={48} className="mx-auto mb-4 opacity-30" />
            <p className="font-medium text-lg">No admins found</p>
            <p className="text-sm">Add your first admin using the button above</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filteredAdmins.map(function(admin) {
              return (
                <div key={admin._id}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition">

                  {/* Avatar */}
                  <div className={"w-12 h-12 rounded-2xl flex items-center justify-center " +
                    "font-extrabold text-lg flex-shrink-0 " +
                    (admin.role === "superadmin"
                      ? "bg-purple-100 text-purple-700"
                      : admin.role === "admin"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-600")}>
                    {admin.name?.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-semibold text-gray-800">{admin.name}</p>
                      <span className={"text-xs font-bold px-2 py-0.5 rounded-lg capitalize " +
                        (roleColors[admin.role] || "bg-gray-100 text-gray-600")}>
                        {admin.role}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">{admin.email}</p>

                    {/* Permissions chips */}
                    {admin.role === "staff" && admin.permissions && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {PERMISSIONS.filter(function(p) {
                          return admin.permissions[p.key]
                        }).map(function(p) {
                          return (
                            <span key={p.key}
                              className="text-xs bg-orange-50 text-[#FFA07A] font-medium
                                         px-2 py-0.5 rounded-lg">
                              {p.label}
                            </span>
                          )
                        })}
                        {!PERMISSIONS.some(function(p) {
                          return admin.permissions[p.key]
                        }) && (
                          <span className="text-xs text-gray-400">No permissions set</span>
                        )}
                      </div>
                    )}

                    {admin.role === "admin" && (
                      <p className="text-xs text-blue-500 mt-1">Full admin access</p>
                    )}

                    {admin.role === "superadmin" && (
                      <p className="text-xs text-purple-500 mt-1">
                        Full system access — cannot be modified
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  {admin.role !== "superadmin" && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={function() { openEdit(admin) }}
                        className="p-2 rounded-xl bg-blue-50 text-blue-600
                                   hover:bg-blue-100 transition"
                        title="Edit Permissions"
                      >
                        <FiEdit2 size={14} />
                      </button>
                      <button
                        onClick={function() { handleRemove(admin._id) }}
                        disabled={deleting === admin._id}
                        className="p-2 rounded-xl bg-red-50 text-red-500
                                   hover:bg-red-100 transition disabled:opacity-50"
                        title="Remove Admin"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center
                        justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl my-4">

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5 border-b">
              <h2 className="text-lg font-extrabold text-[#1D3557]">
                {editAdmin ? "Edit Admin — " + editAdmin.name : "Add New Admin"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={22} />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">

              {/* Search user — only for new admins */}
              {!editAdmin && (
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1.5 block">
                    Find User by Email *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={searchEmail}
                      onChange={function(e) { setSearchEmail(e.target.value) }}
                      onKeyDown={function(e) {
                        if (e.key === "Enter") searchUser()
                      }}
                      placeholder="user@email.com"
                      className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5
                                 text-sm outline-none focus:border-[#FFA07A] transition"
                    />
                    <button
                      onClick={searchUser}
                      disabled={searching}
                      className="bg-[#1D3557] hover:bg-blue-900 text-white font-bold
                                 px-4 py-2.5 rounded-xl transition text-sm disabled:opacity-50"
                    >
                      {searching ? "..." : "Search"}
                    </button>
                  </div>

                  {/* Found user */}
                  {foundUser && (
                    <div className="mt-3 flex items-center gap-3 bg-green-50
                                    border border-green-200 rounded-xl p-3">
                      <div className="w-10 h-10 rounded-xl bg-green-100 text-green-700
                                      flex items-center justify-center font-bold">
                        {foundUser.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800 text-sm">
                          {foundUser.name}
                        </p>
                        <p className="text-xs text-gray-500">{foundUser.email}</p>
                      </div>
                      <FiCheck size={18} className="text-green-600" />
                    </div>
                  )}
                </div>
              )}

              {/* Role selector */}
              <div>
                <label className="text-xs font-bold text-gray-600 mb-2 block">
                  Assign Role *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {ROLES.map(function(role) {
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={function() { setSelectedRole(role) }}
                        className={"py-3 px-4 rounded-xl border-2 text-sm font-bold " +
                          "capitalize transition text-left " +
                          (selectedRole === role
                            ? "border-[#FFA07A] bg-orange-50 text-[#FFA07A]"
                            : "border-gray-200 text-gray-500 hover:border-gray-300")}
                      >
                        <div className="flex items-center gap-2">
                          {role === "admin"
                            ? <FiShield size={16} />
                            : <FiUser size={16} />}
                          {role}
                        </div>
                        <p className="text-xs font-normal mt-1 text-gray-400">
                          {role === "admin"
                            ? "Full admin access"
                            : "Limited — set permissions below"}
                        </p>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Permissions — only for staff */}
              {selectedRole === "staff" && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-bold text-gray-600">
                      Permissions
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={function() { setAllPermissions(true) }}
                        className="text-xs text-[#FFA07A] font-semibold hover:underline"
                      >
                        Select All
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        type="button"
                        onClick={function() { setAllPermissions(false) }}
                        className="text-xs text-gray-400 font-semibold hover:underline"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {PERMISSIONS.map(function(perm) {
                      return (
                        <div
                          key={perm.key}
                          onClick={function() { togglePermission(perm.key) }}
                          className={"flex items-center justify-between p-3 rounded-xl " +
                            "border-2 cursor-pointer transition " +
                            (permissions[perm.key]
                              ? "border-[#FFA07A] bg-orange-50"
                              : "border-gray-100 hover:border-gray-200")}
                        >
                          <div>
                            <p className="text-sm font-semibold text-gray-800">
                              {perm.label}
                            </p>
                            <p className="text-xs text-gray-400">{perm.desc}</p>
                          </div>
                          <div className={"w-5 h-5 rounded-lg border-2 flex items-center " +
                            "justify-center flex-shrink-0 transition " +
                            (permissions[perm.key]
                              ? "bg-[#FFA07A] border-[#FFA07A]"
                              : "border-gray-300")}>
                            {permissions[perm.key] && (
                              <FiCheck size={12} className="text-white" />
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {selectedRole === "admin" && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <p className="text-sm text-blue-700 font-medium">
                    ℹ️ Admin role has full access to all features except Super Admin controls.
                    No individual permissions needed.
                  </p>
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="flex gap-3 px-6 py-5 border-t">
              <button
                onClick={closeModal}
                className="flex-1 border-2 border-gray-200 text-gray-700 font-bold
                           py-3 rounded-xl hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-[#FFA07A] hover:bg-orange-500 disabled:bg-gray-300
                           text-white font-bold py-3 rounded-xl transition"
              >
                {saving
                  ? "Saving..."
                  : editAdmin ? "Update Admin" : "Promote User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}