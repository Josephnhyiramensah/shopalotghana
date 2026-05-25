import { createContext, useReducer, useEffect } from "react"
import { useSettings } from "../hooks/useSettings"

// eslint-disable-next-line react-refresh/only-export-components
export const CartContext = createContext()

function cartReducer(state, action) {
  switch (action.type) {
    case "ADD_ITEM": {
      const exists = state.items.find(function(i) {
        return i._id === action.payload._id
      })
      if (exists) {
        return {
          ...state,
          items: state.items.map(function(i) {
            return i._id === action.payload._id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          })
        }
      }
      return { ...state, items: [...state.items, { ...action.payload, quantity: 1 }] }
    }
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter(function(i) { return i._id !== action.payload })
      }
    case "UPDATE_QTY":
      return {
        ...state,
        items: state.items.map(function(i) {
          return i._id === action.payload.id
            ? { ...i, quantity: action.payload.qty }
            : i
        })
      }
    case "APPLY_COUPON":
      return { ...state, coupon: action.payload }
    case "REMOVE_COUPON":
      return { ...state, coupon: null }
    case "CLEAR_CART":
      return { ...state, items: [], coupon: null }
    default:
      return state
  }
}

function getInitialState() {
  try {
    const saved = localStorage.getItem("cart")
    return saved ? JSON.parse(saved) : { items: [], coupon: null }
  } catch {
    return { items: [], coupon: null }
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, getInitialState())
  const { settings } = useSettings()

 const DELIVERY_FEE = settings?.deliveryFee ?? 30
const FREE_THRESHOLD = settings?.freeDeliveryThreshold ?? 500

  useEffect(function() {
    localStorage.setItem("cart", JSON.stringify(state))
  }, [state])

  const subtotal = state.items.reduce(function(sum, item) {
    return sum + (item.discountPrice || item.price) * item.quantity
  }, 0)

  const discount = state.coupon
    ? state.coupon.type === "percentage"
      ? (subtotal * state.coupon.value) / 100
      : state.coupon.value
    : 0

  const afterDiscount = subtotal - discount
  const deliveryFee = afterDiscount >= FREE_THRESHOLD ? 0 : DELIVERY_FEE
  const total = afterDiscount + deliveryFee

  const itemCount = state.items.reduce(function(sum, item) {
    return sum + item.quantity
  }, 0)

  function addToCart(product) {
    dispatch({ type: "ADD_ITEM", payload: product })
  }

  function removeFromCart(id) {
    dispatch({ type: "REMOVE_ITEM", payload: id })
  }

  function updateQuantity(id, qty) {
    if (qty < 1) {
      dispatch({ type: "REMOVE_ITEM", payload: id })
      return
    }
    dispatch({ type: "UPDATE_QTY", payload: { id, qty } })
  }

  function applyCoupon(coupon) {
    dispatch({ type: "APPLY_COUPON", payload: coupon })
  }

  function removeCoupon() {
    dispatch({ type: "REMOVE_COUPON" })
  }

  function clearCart() {
    dispatch({ type: "CLEAR_CART" })
  }

  return (
    <CartContext.Provider value={{
      items: state.items,
      coupon: state.coupon,
      subtotal,
      discount,
      deliveryFee,
      total,
      itemCount,
      freeDeliveryThreshold: FREE_THRESHOLD,
      addToCart,
      removeFromCart,
      updateQuantity,
      applyCoupon,
      removeCoupon,
      clearCart,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export { CartContext as default }