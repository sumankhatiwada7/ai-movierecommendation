import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../../../hooks/useauth";
import WatchlistDropdown from "./watchlistdropdown"

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedSearch = search.trim();

    if (trimmedSearch) {
      navigate(`/search?query=${encodeURIComponent(trimmedSearch)}`);
      setSearch("");
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 bg-surface/90 backdrop-blur border-b border-edge px-6 py-3 flex items-center justify-between text-ink">
      <Link
        to="/"
        className="font-display text-xl font-bold text-primary flex-shrink-0"
      >
        MovieRec
      </Link>

      <Link
        to="/browse"
        className="text-sm text-muted hover:text-ink transition-colors"
      >
        Browse
      </Link>
      
      <WatchlistDropdown/>

      <form
        onSubmit={handleSearch}
        className="flex-1 max-w-md mx-6"
      >
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search movies..."
          className="w-full bg-bg border border-edge rounded-full px-4 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
        />
      </form>

      <div className="flex items-center gap-4 flex-shrink-0">
        {user?.role === "admin" && (
          <Link
            to="/admin/movies"
            className="text-sm text-muted hover:text-ink"
          >
            Admin
          </Link>
        )}

        <span className="text-sm text-muted hidden sm:inline">
          {user?.name}
        </span>

        <button
          onClick={handleLogout}
          className="text-sm bg-bg border border-edge hover:border-primary hover:text-primary px-4 py-1.5 rounded-full transition"
        >
          Log out
        </button>
      </div>
    </nav>
  );
}