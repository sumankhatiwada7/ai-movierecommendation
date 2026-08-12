import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import Login from "./pages/auth/login";
import Register from "./pages/auth/register";
import Homepage from "./pages/homepage/movie/homepage";
import Moviedetail from "./pages/homepage/movie/moviedetail";
import BrowseMovies from "./pages/homepage/movie/BrowseMovies";
import Navbar from "./pages/homepage/movie/components/Navbar";

import ProtectedRoute from "./route/protectedroute";
import { useAuth } from "./hooks/useauth";

function AppRoutes() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  if (user && (location.pathname === "/login" || location.pathname === "/register")) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <Login />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/" replace /> : <Register />}
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <>
                <Navbar />
                <Homepage />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/movies/:id"
          element={
            <ProtectedRoute>
              <>
                <Navbar />
                <Moviedetail />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/browse"
          element={
            user ? (
              <>
                <Navbar />
                <BrowseMovies />
              </>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;