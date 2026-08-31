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
    <footer className="border-t border-slate-100 bg-[#0B0F13]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            {/* Explicitly tell Logo to render in white text for the dark footer */}
            <Logo dark={false} />
            <p className="mt-4 max-w-xs font-body text-sm text-gray-400">
              AI-generated infrastructure plans, matched to vendors who can build them.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="font-display text-sm font-semibold text-white">{col.title}</h4>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-gray-400 transition-colors duration-150 ease-out hover:text-[#0891B2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0891B2] rounded"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 border-t border-white/5 pt-6 font-mono text-xs text-gray-500 text-center">
          <span>© {new Date().getFullYear()} AlgoStrom. All rights reserved.</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer
