import { Routes, Route } from "react-router-dom"
import PublicLayout from "./layouts/PublicLayout"
import Landing from "./pages/Landing"

function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
      </Route>
    </Routes>
  )
}

export default App
