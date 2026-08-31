import { Outlet } from "react-router-dom"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"

function PublicLayout() {
  return (
<<<<<<< HEAD
    <div className="flex min-h-screen flex-col bg-paper dark:bg-zinc-950">
=======
    <div className="flex min-h-screen flex-col bg-paper">
>>>>>>> 22d08c27bb413cfd23ddb2b1f114a8878693c029
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default PublicLayout
