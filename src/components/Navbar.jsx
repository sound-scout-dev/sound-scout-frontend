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
    `text-sm font-medium transition-colors duration-150 ease-out hover:text-signal-amber ${
      isActive ? "text-signal-amber" : "text-paper/80"
    }`

  const dashboardPath = user
    ? (user.role === "vendor" ? "/vendor/dashboard" : "/organizer/dashboard")
    : "/"

  return (
    <header className="sticky top-0 z-50 border-b border-paper/10 bg-ink-navy">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to={dashboardPath} className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal-amber rounded">
          <Logo />
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.label} to={link.to} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            to="/instant-rental"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-alert-red transition-colors duration-150 ease-out hover:text-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-alert-red rounded"
          >
            <Zap size={15} strokeWidth={2.5} />
            Instant Rental
          </Link>
          {user ? (
            <>
              <Button as={Link} to={dashboardPath} variant="ghost" size="sm" className="text-paper hover:bg-paper/10 active:bg-paper/15">
                Dashboard
              </Button>
              <Button onClick={logout} variant="primary" size="sm">
                Log out
              </Button>
            </>
          ) : (
            <>
              <Button as={Link} to="/login" variant="ghost" size="sm" className="text-paper hover:bg-paper/10 active:bg-paper/15">
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
          className="flex items-center justify-center rounded p-2 text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal-amber md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-paper/10 bg-ink-navy px-4 pb-6 pt-4 md:hidden">
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
              className="inline-flex items-center gap-1.5 text-sm font-medium text-alert-red"
              onClick={() => setOpen(false)}
            >
              <Zap size={15} strokeWidth={2.5} />
              Instant Rental
            </Link>
            <div className="flex gap-3 pt-2">
              {user ? (
                <>
                  <Button as={Link} to={dashboardPath} variant="outline" size="sm" className="flex-1" onClick={() => setOpen(false)}>
                    Dashboard
                  </Button>
                  <Button onClick={() => { logout(); setOpen(false); }} variant="primary" size="sm" className="flex-1">
                    Log out
                  </Button>
                </>
              ) : (
                <>
                  <Button as={Link} to="/login" variant="outline" size="sm" className="flex-1" onClick={() => setOpen(false)}>
                    Log in
                  </Button>
                  <Button as={Link} to="/register" variant="primary" size="sm" className="flex-1" onClick={() => setOpen(false)}>
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
