import { createContext, useState, useEffect } from "react"
const WishlistContext = createContext()

export const WishlistProvider = ({ children }) => {
  const [items, setItems] = useState(
    JSON.parse(localStorage.getItem("wishlist")) || []
  )

  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(items))
  }, [items])

  const addToWishlist = (product) => {
    setItems(prev =>
      prev.find(i => i._id === product._id) ? prev : [...prev, product]
    )
  }

  const removeFromWishlist = (id) => {
    setItems(prev => prev.filter(i => i._id !== id))
  }

  const isInWishlist = (id) => items.some(i => i._id === id)

  return (
    <WishlistContext.Provider value={{ items, addToWishlist, removeFromWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  )
}

export { WishlistContext }