import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../../hooks/useauth";

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const [form, setform] = useState({
    email: "",
    password: "",
  });
  const [loading, setloading] = useState(false);

  const handlechange = (e: ChangeEvent<HTMLInputElement>) => {
    setform({ ...form, [e.target.name]: e.target.value });
  };

  async function handlesubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setloading(true);
    try {
      await login({
        email: form.email,
        password: form.password,
      });
      toast.success("Welcome back! Choose a plan to continue.");
      navigate("/");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Login failed.");
    } finally {
      setloading(false);
    }
  }

  return (
    <div className="hotflix-shell flex min-h-screen items-center justify-center px-4 py-10">
      <form
        onSubmit={handlesubmit}
        className="w-full max-w-md space-y-5 rounded-md border border-white/10 bg-surface p-8 shadow-2xl md:p-10"
      >
        <div className="mb-8 text-center"><div className="font-display text-3xl font-extrabold text-primary">HOT<span className="text-white">FLIX</span></div><p className="mt-3 text-sm text-muted">Welcome back. Your next story is waiting.</p></div>
        <h1 className="font-display text-xl font-bold text-white">
          Sign in
        </h1>

        <div>
          <label className="mb-1 block text-sm text-muted">Email</label>
          <input
            type="email"
            className="hotflix-input"
            name="email"
            value={form.email}
            onChange={handlechange}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-muted">Password</label>
          <input
            type="password"
            className="hotflix-input"
            name="password"
            value={form.password}
            onChange={handlechange}
          />
        </div>

        <button
          disabled={loading}
          className="w-full rounded bg-primary py-3 font-bold text-black transition hover:bg-white disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-center text-sm text-muted">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary hover:text-primary-dark hover:underline">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}