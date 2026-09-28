import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../../../hooks/useauth";
import WatchlistDropdown from "./watchlistdropdown"

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);

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
    <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#111114]/95 text-ink backdrop-blur-xl">
      <div className="page-width flex min-h-[88px] items-center gap-6">
        <Link
          to="/"
          className="font-display flex-shrink-0 text-3xl font-extrabold tracking-tight text-primary"
        >
          HOT<span className="text-white">FLIX</span>
        </Link>
        <div className="hidden items-center gap-6 text-[.7rem] font-bold uppercase tracking-[.12em] text-muted md:flex">
          <Link to="/" className="transition hover:text-primary">Home</Link>
          <Link to="/browse" className="transition hover:text-primary">Catalog</Link>
          <Link to="/browse?view=trending" className="transition hover:text-primary">Top rated</Link>
          <Link to="/subscription" className="transition hover:text-primary">Pricing</Link>
          <WatchlistDropdown />
        </div>
        <form onSubmit={handleSearch} className="ml-auto hidden w-full max-w-[285px] md:block">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search titles..."
            className="hotflix-input !rounded-full !py-2 !px-4 text-sm"
          />
        </form>
        <div className="relative flex flex-shrink-0 items-center">
        <button
          onClick={() => setProfileOpen((open) => !open)}
          className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-2 py-2 transition hover:border-primary"
          aria-expanded={profileOpen}
          aria-label="Open profile menu"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary font-display text-sm font-extrabold text-black">
            {(user?.name?.charAt(0) || "U").toUpperCase()}
          </span>
          <span className="hidden max-w-[110px] truncate text-xs font-semibold text-white sm:block">{user?.name || "Profile"}</span>
          <svg className="h-4 w-4 text-muted" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z" clipRule="evenodd" />
          </svg>
        </button>
        {profileOpen && (
          <div className="absolute right-0 top-[calc(100%+12px)] z-50 w-52 rounded-md border border-white/10 bg-[#202026] p-2 shadow-2xl">
            <div className="border-b border-white/10 px-3 py-3">
              <p className="truncate text-sm font-semibold text-white">{user?.name || "Profile"}</p>
              <p className="truncate text-xs text-muted">{user?.email || ""}</p>
            </div>
            {user?.role === "admin" && (
              <Link to="/admin/movies" onClick={() => setProfileOpen(false)} className="block rounded px-3 py-2 text-sm text-muted hover:bg-white/5 hover:text-white">Admin</Link>
            )}
            <button
              onClick={handleLogout}
              className="mt-1 w-full rounded px-3 py-2 text-left text-sm text-primary hover:bg-primary/10"
            >
              Log out
            </button>
          </div>
        )}
        </div>
      </div>
    </nav>
  );
}