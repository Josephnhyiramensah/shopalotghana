import { useState, useEffect } from "react"
import axios from "axios"
import App from "./App.jsx"
import PageLoader from "./components/common/PageLoader.jsx"

// ✅ Global axios config — runs once
axios.defaults.baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

// ✅ Auto-attach token to every request
axios.interceptors.request.use(function(config) {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = "Bearer " + token
  }
  return config
})

export default function Root() {
  const [done, setDone] = useState(false)

  useEffect(function() {
    const t = setTimeout(function() { setDone(true) }, 2600)
    return function() { clearTimeout(t) }
  }, [])

  return (
    <>
      {!done && <PageLoader />}
      <App />
    </>
  )
}