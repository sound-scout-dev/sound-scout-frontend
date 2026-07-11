import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function DashboardLayout({ role = 'organizer' }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const organizerLinks = [
    { to: '/organizer', label: 'Dashboard', icon: DashboardIcon },
    { to: '/organizer/new-event', label: 'New Event', icon: PlusIcon },
  ];

  const vendorLinks = [
    { to: '/vendor', label: 'Dashboard', icon: DashboardIcon },
  ];

  const links = role === 'vendor' ? vendorLinks : organizerLinks;

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-paper flex">
      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-ink-navy/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen w-64 bg-ink-navy text-white z-50
          transform transition-transform duration-200 lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          flex flex-col
        `}
      >
        {/* Logo */}
        <div className="px-5 py-5 flex items-center gap-2 border-b border-white/10">
          <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="6" fill="#FFB020" />
            <path d="M8 8h5v5H8V8zm7 0h5v5h-5V8zm-7 7h5v5H8v-5zm7 2.5a2.5 2.5 0 115 0 2.5 2.5 0 01-5 0z" fill="#12122B" />
          </svg>
          <span className="font-display font-bold text-lg">
            Event<span className="text-signal-amber">Scout</span>
          </span>
        </div>

        {/* Role indicator */}
        <div className="px-5 py-3 border-b border-white/5">
          <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-mono font-medium ${
            role === 'vendor' ? 'bg-circuit-teal/20 text-circuit-teal' : 'bg-signal-amber/20 text-signal-amber'
          }`}>
            {role === 'vendor' ? 'Vendor' : 'Organizer'}
          </span>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {links.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                id={`sidebar-${label.toLowerCase().replace(/\s+/g, '-')}`}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors
                  ${isActive
                    ? 'bg-white/10 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                  }
                `}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="px-3 py-4 border-t border-white/10 space-y-1">
          <Link
            to={role === 'vendor' ? '/organizer' : '/vendor'}
            className="flex items-center gap-3 px-3 py-2.5 rounded text-sm text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <SwapIcon />
            Switch to {role === 'vendor' ? 'Organizer' : 'Vendor'}
          </Link>
          <button
            id="sidebar-logout"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors text-left"
          >
            <LogoutIcon />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-paper/80 backdrop-blur-sm border-b border-ink-navy/5 px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <button
              id="mobile-sidebar-toggle"
              className="lg:hidden p-2 -ml-2 text-ink-navy hover:bg-ink-navy/5 rounded transition-colors"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            </button>

            <div className="flex items-center gap-3 ml-auto">
              <div className="w-8 h-8 rounded bg-ink-navy text-white flex items-center justify-center text-xs font-display font-semibold">
                {role === 'vendor' ? 'MR' : 'SC'}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

/* ── Inline SVG Icons ── */

function DashboardIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8m-4-4h8" />
    </svg>
  );
}

function SwapIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M7 16V4m0 0L3 8m4-4l4 4m6 4v12m0 0l4-4m-4 4l-4-4" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4m7 14l5-5-5-5m5 5H9" />
    </svg>
  );
}
