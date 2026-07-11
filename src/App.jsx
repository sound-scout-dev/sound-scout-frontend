import { Routes, Route } from "react-router-dom"
import PublicLayout from "./layouts/PublicLayout"
import AuthLayout from "./layouts/AuthLayout"
import DashboardLayout from "./layouts/DashboardLayout"
import Landing from "./pages/Landing"
import Login from "./pages/Login"
import Register from "./pages/Register"
import InstantRental from "./pages/InstantRental"
import OrganizerDashboard from "./pages/organizer/OrganizerDashboard"
import NewEvent from "./pages/organizer/NewEvent"
import EventDetail from "./pages/organizer/EventDetail"
import VendorDashboard from "./pages/vendor/VendorDashboard"

function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/instant-rental" element={<InstantRental />} />
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<DashboardLayout role="Organizer" />}>
        <Route path="/organizer/dashboard" element={<OrganizerDashboard />} />
        <Route path="/organizer/events/new" element={<NewEvent />} />
        <Route path="/organizer/events/:id" element={<EventDetail />} />
      </Route>

      <Route element={<DashboardLayout role="Vendor" />}>
        <Route path="/vendor/dashboard" element={<VendorDashboard />} />
      </Route>
    </Routes>
  )
}

export default App
