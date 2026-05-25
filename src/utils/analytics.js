// ── Google Analytics Events ──
export function gaEvent(eventName, params) {
  if (window.gtag) {
    window.gtag("event", eventName, params)
  }
}

// ── Meta Pixel Events ──
export function fbEvent(eventName, params) {
  if (window.fbq) {
    window.fbq("track", eventName, params)
  }
}

// ── TikTok Pixel Events ──
export function ttEvent(eventName, params) {
  if (window.ttq) {
    window.ttq.track(eventName, params)
  }
}

// ── Track all at once ──
export function trackEvent(eventName, params) {
  gaEvent(eventName, params)
  fbEvent(eventName, params)
  ttEvent(eventName, params)
}

// ── Ecommerce specific events ──

export function trackViewProduct(product) {
  const data = {
    content_ids: [product._id],
    content_name: product.name,
    content_type: "product",
    value: product.discountPrice || product.price,
    currency: "GHS",
  }
  gaEvent("view_item", {
    items: [{ item_id: product._id, item_name: product.name, price: data.value }]
  })
  fbEvent("ViewContent", data)
  ttEvent("ViewContent", data)
}

export function trackAddToCart(product) {
  const data = {
    content_ids: [product._id],
    content_name: product.name,
    content_type: "product",
    value: product.discountPrice || product.price,
    currency: "GHS",
  }
  gaEvent("add_to_cart", {
    items: [{ item_id: product._id, item_name: product.name, price: data.value }]
  })
  fbEvent("AddToCart", data)
  ttEvent("AddToCart", data)
}

export function trackInitiateCheckout(total, items) {
  const data = {
    value: total,
    currency: "GHS",
    num_items: items.length,
  }
  gaEvent("begin_checkout", { value: total, currency: "GHS" })
  fbEvent("InitiateCheckout", data)
  ttEvent("InitiateCheckout", data)
}

export function trackPurchase(orderId, total, items) {
  const data = {
    value: total,
    currency: "GHS",
    content_ids: items.map(function(i) { return i._id }),
    content_type: "product",
    num_items: items.length,
  }
  gaEvent("purchase", {
    transaction_id: orderId,
    value: total,
    currency: "GHS",
  })
  fbEvent("Purchase", data)
  ttEvent("CompletePayment", data)
}

export function trackSearch(query) {
  gaEvent("search", { search_term: query })
  fbEvent("Search", { search_string: query })
  ttEvent("Search", { query: query })
}

export function trackSignUp() {
  gaEvent("sign_up")
  fbEvent("CompleteRegistration")
  ttEvent("CompleteRegistration")
}