import { Link, Outlet } from "react-router-dom"
import Logo from "../components/Logo"

function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0B0F13]">
      <header className="px-4 py-6 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="inline-flex rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0891B2]"
        >
          {/* Explicitly tell Logo to render in white text for the dark authentication pages background */}
          <Logo dark={false} />
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default AuthLayout
