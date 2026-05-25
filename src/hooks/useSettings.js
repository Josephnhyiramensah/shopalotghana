import { useContext } from "react"
import { SettingsContext } from "../context/SettingsContext"

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) {
    return {
      settings: {
        deliveryFee: 30,
        freeDeliveryThreshold: 500,
        phone: "+233 XX XXX XXXX",
        email: "support@shopalotghana.com",
        address: "Accra, Ghana",
      },
      loading: false
    }
  }
  return context
}