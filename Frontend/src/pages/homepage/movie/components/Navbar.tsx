import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../../../hooks/useauth";

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
    <nav className="sticky top-0 z-50 bg-black/90 backdrop-blur px-6 py-3 flex items-center justify-between text-white">
      <Link
        to="/"
        className="text-xl font-bold text-red-600 flex-shrink-0"
      >
        MovieRec
      </Link>

      <Link
        to="/browse"
        className="text-sm text-gray-300 hover:text-white"
      >
        Browse
      </Link>

      <form
        onSubmit={handleSearch}
        className="flex-1 max-w-md mx-6"
      >
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search movies..."
          className="w-full bg-gray-800 rounded px-4 py-1.5 text-sm outline-none focus:ring-1 focus:ring-red-600"
        />
      </form>

      <div className="flex items-center gap-4 flex-shrink-0">
        {user?.role === "admin" && (
          <Link
            to="/admin/movies"
            className="text-sm text-gray-300 hover:text-white"
          >
            Admin
          </Link>
        )}

        <span className="text-sm text-gray-300 hidden sm:inline">
          {user?.name}
        </span>

        <button
          onClick={handleLogout}
          className="text-sm bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded"
        >
          Log out
        </button>
      </div>
    </nav>
  );
}