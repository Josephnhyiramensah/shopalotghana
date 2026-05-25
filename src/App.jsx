import { Toaster } from "react-hot-toast"
import { AuthProvider } from "./context/AuthContext"
import { CartProvider } from "./context/CartContext"
import { WishlistProvider } from "./context/WishlistContext"
import { SettingsProvider } from "./context/SettingsContext"
import AppRoutes from "./routes/AppRoutes"

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <CartProvider>
          <WishlistProvider>
            <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
            <AppRoutes />
          </WishlistProvider>
        </CartProvider>
      </SettingsProvider>
    </AuthProvider>
  )
}

export default App