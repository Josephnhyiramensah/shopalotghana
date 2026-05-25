import { createContext, useEffect, useState, useCallback } from "react"
import axios from "axios"

// eslint-disable-next-line react-refresh/only-export-components
export const SettingsContext = createContext()

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchSettings = useCallback(async function() {
    try {
      const res = await axios.get("/settings")
      if (res.data.settings) {
        setSettings(res.data.settings)
      }
    } catch {
      // keep null — components will use their own fallbacks
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(function() {
    fetchSettings()
    window.addEventListener("focus", fetchSettings)
    return function() {
      window.removeEventListener("focus", fetchSettings)
    }
  }, [fetchSettings])

  return (
    <SettingsContext.Provider value={{ settings, loading, refetchSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}