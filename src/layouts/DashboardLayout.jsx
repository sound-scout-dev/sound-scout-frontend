import { Link, Outlet, useNavigate } from "react-router-dom"
import { LogOut } from "lucide-react"
import Logo from "../components/Logo"
import { useAuth } from "../context/AuthContext"
import { useTheme } from "../context/ThemeContext"
import ThemeToggle from "../components/ThemeToggle"
import SessionTimeoutModal from "../components/SessionTimeoutModal"
import FullPageLoader from "../components/FullPageLoader"
import { useEffect } from "react"

function DashboardLayout({ role = "Organizer" }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { isDarkMode } = useTheme()

  useEffect(() => {
    if (!user) {
      navigate("/login")
    } else {
      const lowerUserRole = user.role?.toLowerCase()
      const lowerLayoutRole = role.toLowerCase()
      if (lowerUserRole !== lowerLayoutRole) {
        navigate(lowerUserRole === "organizer" ? "/organizer/dashboard" : "/vendor/dashboard")
      }
    }
  }, [user, role, navigate])

  function handleLogout() {
    logout()
    navigate("/")
  }

  if (!user || user.role?.toLowerCase() !== role.toLowerCase()) {
    // Rendering null here (e.g. right when a session expires mid-session) blanked the entire
    // page for a frame before the redirect effect above could run. Show a themed loader instead
    // so an in-flight session expiry reads as "redirecting" rather than a jarring blank screen.
    return <FullPageLoader message="REDIRECTING..." />
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50/50 dark:bg-zinc-950">
      <header
        className="border-b border-gray-200/60 dark:border-zinc-800/80 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md sticky top-0 z-50"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between gap-2 px-3 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="shrink-0 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0891B2]"
          >
            {/* Logo has dark brand text visible on this light header */}
            <Logo dark={!isDarkMode} compact />
          </Link>

          <div className="flex items-center gap-2 sm:gap-6 overflow-x-auto">
            <Link
              to={role === "Organizer" ? "/organizer/dashboard" : "/vendor/dashboard"}
              className="shrink-0 font-body text-xs sm:text-sm font-semibold text-gray-600 dark:text-zinc-300 hover:text-[#0891B2] dark:hover:text-[#0891B2] transition-colors"
            >
              Dashboard
            </Link>

            <Link
              to={role === "Organizer" ? "/organizer/profile" : "/vendor/profile"}
              className="shrink-0 font-body text-xs sm:text-sm font-semibold text-gray-600 dark:text-zinc-300 hover:text-[#0891B2] dark:hover:text-[#0891B2] transition-colors"
            >
              Profile
            </Link>

            <span className="hidden md:inline-block shrink-0 rounded border border-gray-200 dark:border-zinc-800 bg-gray-100/80 dark:bg-zinc-900 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-gray-600 dark:text-zinc-300">
              {role}
            </span>

            {user?.name && (
              <span className="hidden lg:inline shrink-0 font-body text-sm text-gray-500 dark:text-zinc-400 font-medium">
                Hi, {user.name.split(" ")[0]}
              </span>
            )}

            <button
              type="button"
              onClick={handleLogout}
              aria-label="Log out"
              className="shrink-0 flex items-center gap-1.5 rounded px-1.5 sm:px-2 py-1.5 text-sm font-medium text-gray-600 dark:text-zinc-300 transition-colors duration-150 ease-out hover:text-red-650 dark:hover:text-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0891B2]"
            >
              <LogOut size={14} strokeWidth={2} />
              <span className="hidden sm:inline">Log out</span>
            </button>

            <div className="shrink-0">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-x-hidden">
        <Outlet />
      </main>

      <SessionTimeoutModal />
    </div>
  )
}

export default DashboardLayout
