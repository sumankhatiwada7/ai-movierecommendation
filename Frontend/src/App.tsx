// frontend/src/App.tsx — now much simpler, no manual refresh logic here
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/login";
import Register from "./pages/auth/register";
import Homepage from "./pages/homepage/movie/homepage";
import Moviedetail from "./pages/homepage/movie/moviedetail";

import ProtectedRoute from "./route/protectedroute";
import { useAuth } from "./hooks/useauth";

function App() {
  const { isLoading } = useAuth() as any;

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Homepage />
            </ProtectedRoute>
          }
        />
        <Route path="/movies/:id" element={
          <ProtectedRoute>
            <Moviedetail />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;