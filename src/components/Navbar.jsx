import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

export default function Navbar({ transparent = false }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const isLanding = location.pathname === '/';
  const bgClass = transparent
    ? 'bg-transparent'
    : 'bg-ink-navy';

  return (
    <nav
      id="main-navbar"
      className={`${bgClass} fixed top-0 left-0 right-0 z-50 transition-colors duration-300`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            id="nav-logo"
            className="flex items-center gap-2 text-white font-display font-bold text-xl tracking-tight hover:opacity-90 transition-opacity"
          >
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="shrink-0">
              <rect width="28" height="28" rx="6" fill="#FFB020" />
              <path d="M8 8h5v5H8V8zm7 0h5v5h-5V8zm-7 7h5v5H8v-5zm7 2.5a2.5 2.5 0 115 0 2.5 2.5 0 01-5 0z" fill="#12122B" />
            </svg>
            <span>
              Event<span className="text-signal-amber">Scout</span> AI
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            {isLanding && (
              <>
                <a href="#how-it-works" className="text-white/70 hover:text-white text-sm font-medium transition-colors">
                  How It Works
                </a>
                <a href="#stats" className="text-white/70 hover:text-white text-sm font-medium transition-colors">
                  Why EventScout
                </a>
              </>
            )}
            <Link
              to="/login"
              id="nav-login"
              className="text-white/90 hover:text-white text-sm font-medium transition-colors"
            >
              Log In
            </Link>
            <Link
              to="/register"
              id="nav-signup"
              className="bg-signal-amber hover:bg-signal-amber-dark text-ink-navy text-sm font-semibold px-4 py-2 rounded transition-colors"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile burger */}
          <button
            id="nav-mobile-toggle"
            className="md:hidden text-white p-2 hover:bg-white/10 rounded transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-ink-navy border-t border-white/10 px-4 pb-4 animate-fade-in">
          {isLanding && (
            <>
              <a
                href="#how-it-works"
                className="block py-3 text-white/70 hover:text-white text-sm border-b border-white/5"
                onClick={() => setMobileOpen(false)}
              >
                How It Works
              </a>
              <a
                href="#stats"
                className="block py-3 text-white/70 hover:text-white text-sm border-b border-white/5"
                onClick={() => setMobileOpen(false)}
              >
                Why EventScout
              </a>
            </>
          )}
          <Link
            to="/login"
            className="block py-3 text-white/90 hover:text-white text-sm border-b border-white/5"
            onClick={() => setMobileOpen(false)}
          >
            Log In
          </Link>
          <Link
            to="/register"
            className="block mt-3 bg-signal-amber hover:bg-signal-amber-dark text-ink-navy text-sm font-semibold px-4 py-2.5 rounded text-center transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            Get Started
          </Link>
        </div>
      )}
    </nav>
  );
}
