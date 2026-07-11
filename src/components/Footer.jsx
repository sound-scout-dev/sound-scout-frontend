import { Link } from "react-router-dom"
import Logo from "./Logo"

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "How it works", to: "/#how-it-works" },
      { label: "Features", to: "/#features" },
      { label: "Instant Rental", to: "/instant-rental" },
    ],
  },
  {
    title: "For",
    links: [
      { label: "Event Organizers", to: "/register" },
      { label: "Rental Vendors", to: "/register" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Log in", to: "/login" },
      { label: "Create account", to: "/register" },
    ],
  },
]

function Footer() {
  return (
    <footer className="border-t border-paper/10 bg-ink-navy">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Logo />
            <p className="mt-3 max-w-xs font-body text-sm text-paper/60">
              AI-generated infrastructure plans, matched to vendors who can build them.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="font-display text-sm font-semibold text-paper">{col.title}</h4>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-paper/60 transition-colors duration-150 ease-out hover:text-signal-amber focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal-amber rounded"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-paper/10 pt-6 font-mono text-xs text-paper/40 sm:flex-row">
          <span>© {new Date().getFullYear()} SoundScout. All rights reserved.</span>
          <span>Built for a university competition demo.</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer
