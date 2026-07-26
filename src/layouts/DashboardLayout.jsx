import { Link, Outlet, useNavigate } from "react-router-dom"
import { LogOut } from "lucide-react"
import Logo from "../components/Logo"
import { useAuth } from "../context/AuthContext"
import SessionTimeoutModal from "../components/SessionTimeoutModal"
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
    <div className="flex min-h-screen flex-col bg-gray-50/50">
      <header className="border-b border-gray-200/60 bg-white/95 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0891B2]"
          >
            {/* Logo has dark brand text visible on this light header */}
            <Logo dark={true} />
          </Link>

          <div className="flex items-center gap-6">
            <Link
              to={role === "Organizer" ? "/organizer/dashboard" : "/vendor/dashboard"}
              className="font-body text-sm font-semibold text-gray-600 hover:text-[#0891B2] transition-colors"
            >
              Dashboard
            </Link>
            
            <Link
              to={role === "Organizer" ? "/organizer/profile" : "/vendor/profile"}
              className="font-body text-sm font-semibold text-gray-600 hover:text-[#0891B2] transition-colors"
            >
              Profile
            </Link>

            <span className="rounded border border-gray-200 bg-gray-100/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-gray-600">
              {role}
            </span>

            {user?.name && (
              <span className="font-body text-sm text-gray-500 font-medium">
                Hi, {user.name.split(" ")[0]}
              </span>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded px-2 py-1.5 text-sm font-medium text-gray-600 transition-colors duration-150 ease-out hover:text-red-650 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0891B2]"
            >
              <LogOut size={14} strokeWidth={2} />
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <SessionTimeoutModal />
    </div>
  )
}

export default DashboardLayout
