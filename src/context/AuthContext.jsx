import { createContext, useState, useEffect, useCallback } from "react"
import axios from "axios"

const AuthContext = createContext()

axios.defaults.baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem("token") || null)
  const [loading, setLoading] = useState(true)

  const logout = useCallback(function() {
    setUser(null)
    setToken(null)
    localStorage.removeItem("token")
    delete axios.defaults.headers.common["Authorization"]
  }, [])

  const fetchMe = useCallback(async function() {
    try {
      const { data } = await axios.get("/auth/me")
      setUser(data.user)
    } catch {
      logout()
    } finally {
      setLoading(false)
    }
  }, [logout])

  useEffect(function() {
    if (token) {
      axios.defaults.headers.common["Authorization"] = "Bearer " + token
      fetchMe()
    } else {
      setLoading(false)
    }
  }, [token, fetchMe])

  const login = async function(email, password) {
    const { data } = await axios.post("/auth/login", { email, password })
    setToken(data.token)
    setUser(data.user)
    localStorage.setItem("token", data.token)
    axios.defaults.headers.common["Authorization"] = "Bearer " + data.token
    return data.user
  }

  const register = async function(name, email, password, phone) {
    const { data } = await axios.post("/auth/register", { name, email, password, phone })
    setToken(data.token)
    setUser(data.user)
    localStorage.setItem("token", data.token)
    axios.defaults.headers.common["Authorization"] = "Bearer " + data.token
    return data.user
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext }