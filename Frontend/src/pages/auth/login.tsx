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
      toast.success("Welcome back!");
      navigate("/");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Login failed.");
    } finally {
      setloading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg">
      <form
        onSubmit={handlesubmit}
        className="w-full max-w-md space-y-4 rounded-2xl bg-surface border border-edge p-8 shadow-lg"
      >
        <h1 className="font-display text-3xl font-bold text-center text-ink">
          Login
        </h1>

        <div>
          <label className="mb-1 block text-sm text-muted">Email</label>
          <input
            type="email"
            className="w-full rounded-lg border border-edge bg-bg p-2 text-ink outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
            name="email"
            value={form.email}
            onChange={handlechange}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-muted">Password</label>
          <input
            type="password"
            className="w-full rounded-lg border border-edge bg-bg p-2 text-ink outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
            name="password"
            value={form.password}
            onChange={handlechange}
          />
        </div>

        <button
          disabled={loading}
          className="w-full rounded-full bg-primary py-2.5 font-semibold text-bg hover:bg-primary-dark disabled:opacity-50 transition"
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