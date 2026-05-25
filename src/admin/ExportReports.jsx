import { useState } from "react"
import axios from "axios"
import toast from "react-hot-toast"
import {
  FiDownload, FiShoppingBag, FiUsers,
  FiDollarSign, FiPackage, FiFileText
} from "react-icons/fi"

const reports = [
  {
    id: "orders",
    title: "Orders Report",
    desc: "All orders with customer details, amounts, payment methods and status",
    icon: <FiShoppingBag size={24} />,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    filename: "orders.csv",
    url: "/export/orders",
  },
  {
    id: "financial",
    title: "Financial Report",
    desc: "Revenue breakdown — subtotal, discounts, delivery fees and totals",
    icon: <FiDollarSign size={24} />,
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-200",
    filename: "financial-report.csv",
    url: "/export/financial",
  },
  {
    id: "users",
    title: "Customer Report",
    desc: "All registered customers with contact info and account status",
    icon: <FiUsers size={24} />,
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-200",
    filename: "users.csv",
    url: "/export/users",
  },
  {
    id: "products",
    title: "Products Report",
    desc: "Full inventory — prices, stock levels, ratings and categories",
    icon: <FiPackage size={24} />,
    color: "text-orange-500",
    bg: "bg-orange-50",
    border: "border-orange-200",
    filename: "products.csv",
    url: "/export/products",
  },
]

export default function ExportReports() {
  const [downloading, setDownloading] = useState(null)
  const [downloaded, setDownloaded] = useState([])

  async function handleDownload(report) {
    setDownloading(report.id)
    try {
      const response = await axios.get(report.url, {
        responseType: "blob",
      })

      const blob = new Blob([response.data], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = report.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success(report.title + " downloaded!")
      setDownloaded(function(prev) {
        return [...prev, report.id]
      })
    } catch (err) {
      toast.error(err.response?.data?.message || "Download failed")
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-[#1D3557]">Export Reports</h1>
        <p className="text-gray-500 text-sm mt-1">
          Download your store data as CSV files — open in Excel or Google Sheets
        </p>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-8
                      flex items-start gap-3">
        <FiFileText size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-blue-700">CSV Format</p>
          <p className="text-xs text-blue-500 mt-0.5">
            All reports are exported as CSV files. Open them in Microsoft Excel,
            Google Sheets or any spreadsheet software for analysis.
          </p>
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {reports.map(function(report) {
          const isDownloading = downloading === report.id
          const isDownloaded = downloaded.includes(report.id)

          return (
            <div
              key={report.id}
              className={"bg-white rounded-2xl shadow-sm border-2 p-6 transition " +
                (isDownloaded
                  ? "border-green-200"
                  : "border-gray-100 hover:shadow-md")}
            >
              {/* Card header */}
              <div className="flex items-start justify-between mb-4">
                <div className={"w-14 h-14 rounded-2xl flex items-center justify-center " +
                  report.bg + " " + report.color}>
                  {report.icon}
                </div>
                {isDownloaded && (
                  <span className="text-xs bg-green-100 text-green-700 font-bold
                                   px-2.5 py-1 rounded-xl">
                    ✓ Downloaded
                  </span>
                )}
              </div>

              {/* Card body */}
              <h3 className="font-extrabold text-[#1D3557] text-lg mb-1">
                {report.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-5">
                {report.desc}
              </p>

              {/* File info */}
              <div className={"flex items-center gap-2 text-xs font-medium mb-5 " +
                "px-3 py-2 rounded-xl " + report.bg + " " + report.color}>
                <FiFileText size={13} />
                {report.filename}
              </div>

              {/* Download button */}
              <button
                onClick={function() { handleDownload(report) }}
                disabled={isDownloading}
                className={"w-full flex items-center justify-center gap-2 font-bold " +
                  "py-3 rounded-xl transition text-sm " +
                  (isDownloading
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : isDownloaded
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "bg-[#FFA07A] hover:bg-orange-500 text-white")}
              >
                {isDownloading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent
                                    rounded-full animate-spin" />
                    Preparing download...
                  </>
                ) : isDownloaded ? (
                  <>
                    <FiDownload size={16} />
                    Download Again
                  </>
                ) : (
                  <>
                    <FiDownload size={16} />
                    Download {report.title}
                  </>
                )}
              </button>
            </div>
          )
        })}
      </div>

      {/* Tips */}
      <div className="mt-8 bg-gray-50 rounded-2xl p-6 border border-gray-100">
        <h3 className="font-extrabold text-[#1D3557] mb-4">💡 Tips for using reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div className="flex items-start gap-2">
            <span className="text-[#FFA07A] font-bold flex-shrink-0">1.</span>
            Open CSV files in Excel and use
            <span className="font-semibold mx-1">Data → Filter</span>
            to sort by any column
          </div>
          <div className="flex items-start gap-2">
            <span className="text-[#FFA07A] font-bold flex-shrink-0">2.</span>
            Use the Financial Report for monthly accounting
            and tax preparation
          </div>
          <div className="flex items-start gap-2">
            <span className="text-[#FFA07A] font-bold flex-shrink-0">3.</span>
            The Products Report shows low-stock items —
            filter by Stock column
          </div>
          <div className="flex items-start gap-2">
            <span className="text-[#FFA07A] font-bold flex-shrink-0">4.</span>
            Export reports regularly and save them
            for business records
          </div>
        </div>
      </div>
    </div>
  )
}