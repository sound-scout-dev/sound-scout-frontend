import { Link, Outlet, useNavigate } from "react-router-dom"
import { LogOut } from "lucide-react"
import Logo from "../components/Logo"
import { useAuth } from "../context/AuthContext"

import { useEffect } from "react"

function DashboardLayout({ role = "Organizer" }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

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
    return null
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <header className="border-b border-slate/10 bg-ink-navy">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal-amber"
          >
            <Logo />
          </Link>

          <div className="flex items-center gap-4">
            {user?.name && (
              <Link 
                to={role === "Organizer" ? "/organizer/profile" : "/vendor/profile"}
                className="hidden font-body text-sm text-paper/70 hover:text-paper hover:underline sm:inline transition-colors"
              >
                {user.name}
              </Link>
            )}
            <span className="rounded border border-paper/20 px-2.5 py-1 font-mono text-[11px] uppercase tracking-widest text-paper/70">
              {role}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded px-2 py-1.5 text-sm font-medium text-paper/70 transition-colors duration-150 ease-out hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal-amber"
            >
              <LogOut size={15} strokeWidth={2} />
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}

export default DashboardLayout
