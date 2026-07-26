import { useState } from "react"
import { Link, NavLink } from "react-router-dom"
import { Menu, X, Zap } from "lucide-react"
import Logo from "./Logo"
import Button from "./Button"
import { useAuth } from "../context/AuthContext"

const NAV_LINKS = [
  { to: "/#how-it-works", label: "How it works" },
  { to: "/#features", label: "Features" },
]

function Navbar() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()

  const linkClass = ({ isActive }) =>
    `text-sm font-semibold transition-colors duration-150 ease-out hover:text-[#0891B2] ${
      isActive ? "text-[#0891B2]" : "text-gray-600"
    }`

  const dashboardPath = user
    ? (user.role === "vendor" ? "/vendor/dashboard" : "/organizer/dashboard")
    : "/"

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/60 bg-white/95 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to={dashboardPath} className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0891B2] rounded">
          <Logo dark={true} />
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.label} to={link.to} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-4 md:flex">
          <Link
            to="/instant-rental"
            className="inline-flex items-center gap-1.5 text-sm font-mono tracking-wide text-[#0891B2] transition-colors duration-150 ease-out hover:text-[#0e7490] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0891B2] rounded"
          >
            <Zap size={14} className="text-[#059669]" strokeWidth={2.5} />
            Instant Rental
          </Link>
          {user ? (
            <>
              <Link 
                to={user.role === "vendor" ? "/vendor/dashboard" : "/organizer/dashboard"}
                className="text-sm font-semibold text-gray-600 hover:text-[#0891B2] transition-colors"
              >
                Dashboard
              </Link>
              <Link 
                to={user.role === "vendor" ? "/vendor/profile" : "/organizer/profile"}
                className="text-sm font-semibold text-gray-600 hover:text-[#0891B2] transition-colors"
              >
                Profile
              </Link>
              <Button onClick={logout} variant="outline" size="sm" className="border-gray-200 text-gray-700 hover:bg-gray-50">
                Log out
              </Button>
            </>
          ) : (
            <>
              <Button as={Link} to="/login" variant="ghost" size="sm" className="text-gray-700 hover:bg-gray-100/50">
                Log in
              </Button>
              <Button as={Link} to="/register" variant="primary" size="sm">
                Get started
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          className="flex items-center justify-center rounded p-2 text-gray-700 hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0891B2] md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-gray-100 bg-white px-4 pb-6 pt-4 md:hidden">
          <div className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.label}
                to={link.to}
                className={linkClass}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
            <Link
              to="/instant-rental"
              className="inline-flex items-center gap-1.5 text-sm font-mono tracking-wide text-[#0891B2]"
              onClick={() => setOpen(false)}
            >
              <Zap size={14} className="text-[#059669]" strokeWidth={2.5} />
              Instant Rental
            </Link>
            <div className="flex flex-col gap-3 pt-2">
              {user ? (
                <>
                  <Link 
                    to={user.role === "vendor" ? "/vendor/dashboard" : "/organizer/dashboard"}
                    className="text-sm font-semibold text-gray-600 hover:text-[#0891B2] transition-colors py-1"
                    onClick={() => setOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to={user.role === "vendor" ? "/vendor/profile" : "/organizer/profile"}
                    className="text-sm font-semibold text-gray-600 hover:text-[#0891B2] transition-colors py-1"
                    onClick={() => setOpen(false)}
                  >
                    Profile
                  </Link>
                  <Button onClick={() => { logout(); setOpen(false); }} variant="outline" size="sm" className="w-full border-gray-200 text-gray-700">
                    Log out
                  </Button>
                </>
              ) : (
                <>
                  <Button as={Link} to="/login" variant="outline" size="sm" className="w-full border-gray-200 text-gray-700 hover:bg-gray-50" onClick={() => setOpen(false)}>
                    Log in
                  </Button>
                  <Button as={Link} to="/register" variant="primary" size="sm" className="w-full" onClick={() => setOpen(false)}>
                    Get started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
