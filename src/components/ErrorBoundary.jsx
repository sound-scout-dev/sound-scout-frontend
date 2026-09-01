import { Component } from "react"
import { AlertTriangle } from "lucide-react"

// React unmounts the whole tree on an uncaught render error, leaving a blank page with no
// way back for the user. This is the only place in the app that catches that and offers a
// recovery action instead of a dead blank screen.
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error("Unhandled UI error:", error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-4 bg-[#f1f5f9] dark:bg-[#121212] px-6 text-center">
          <AlertTriangle className="h-10 w-10 text-alert-red" />
          <h1 className="font-display text-lg font-semibold text-ink-navy">
            Something went wrong
          </h1>
          <p className="max-w-sm font-body text-sm text-slate">
            An unexpected error interrupted this page. Your progress on this screen may not be saved — reloading will take you back to a safe starting point.
          </p>
          <button
            type="button"
            onClick={() => window.location.assign("/")}
            className="mt-2 rounded-lg bg-[#0891B2] px-5 py-2.5 font-sans text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#0e7490]"
          >
            Back to safety
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
