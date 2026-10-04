import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import Login from "./pages/auth/login";
import Register from "./pages/auth/register";
import ForgotPassword from "./pages/auth/forgotpassword";
import Homepage from "./pages/homepage/movie/homepage";
import Moviedetail from "./pages/homepage/movie/moviedetail";
import BrowseMovies from "./pages/homepage/movie/BrowseMovies";
import Navbar from "./pages/homepage/movie/components/Navbar";
import SearchResults from "./pages/homepage/movie/SearchResults";
import Subscription, { SubscriptionResult } from "./pages/subscription/Subscription";

import ProtectedRoute from "./route/protectedroute";
import { useAuth } from "./hooks/useauth";

function AppRoutes() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  if (user && (location.pathname === "/login" || location.pathname === "/register" || location.pathname === "/forgot-password")) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-[#111114] text-white">
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
          path="/forgot-password"
          element={user ? <Navigate to="/" replace /> : <ForgotPassword />}
        />
        <Route
          path="/"
          element={
            <ProtectedRoute requireSubscription>
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
            <ProtectedRoute requireSubscription>
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
              <ProtectedRoute requireSubscription>
                <>
                  <Navbar />
                  <BrowseMovies />
                </>
              </ProtectedRoute>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/subscription"
          element={
            <ProtectedRoute>
              <>
                <Navbar />
                <Subscription />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/subscription/success"
          element={<><Navbar /><SubscriptionResult /></>}
        />
        <Route
          path="/subscription/cancel"
          element={<><Navbar /><SubscriptionResult /></>}
        />
        
        <Route path="/search" element={<ProtectedRoute requireSubscription><><Navbar /><SearchResults /></></ProtectedRoute>} />
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