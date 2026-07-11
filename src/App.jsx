import { Routes, Route } from "react-router-dom"
import PublicLayout from "./layouts/PublicLayout"
import AuthLayout from "./layouts/AuthLayout"
import Landing from "./pages/Landing"
import Login from "./pages/Login"
import Register from "./pages/Register"

function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>
    </Routes>
  )
}

export default App
