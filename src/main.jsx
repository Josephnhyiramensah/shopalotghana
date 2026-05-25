import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import "./styles/index.css"
import Root from "./Root.jsx"

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error("App crashed:", error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center
                        bg-gray-50 px-4 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-extrabold text-[#1D3557] mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-500 mb-6">
            The page encountered an error. Please clear your browser data and try again.
          </p>
          <button
            onClick={function() {
              localStorage.clear()
              window.location.href = "/"
            }}
            className="bg-[#E63946] text-white font-bold px-6 py-3 rounded-xl
                       hover:bg-red-700 transition"
          >
            Clear Data and Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <Root />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
)