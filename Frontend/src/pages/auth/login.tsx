import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../../hooks/useauth";
import AuthBrandPanel from "./components/AuthBrandPanel";

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
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

  const handlechange = (e: ChangeEvent<HTMLInputElement>) => {
    setform({ ...form, [e.target.name]: e.target.value });
    setErrors((current) => ({ ...current, [e.target.name]: undefined }));
  };

  async function handlesubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const nextErrors: { email?: string; password?: string } = {};
    if (!form.email.trim()) nextErrors.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = "Enter a valid email address.";
    if (!form.password) nextErrors.password = "Password is required.";
    else if (!passwordPattern.test(form.password)) {
      nextErrors.password = "Use 8+ characters with uppercase, lowercase, number, and special character.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setloading(true);
    try {
      await login({
        email: form.email,
        password: form.password,
      });
      toast.success("Welcome back! Choose a plan to continue.");
      navigate("/");
    } catch (error: any) {
      const responseErrors = error?.response?.data?.errors;
      const fieldErrors = error?.response?.data?.fieldErrors;
      if (fieldErrors) setErrors(fieldErrors);
      if (Array.isArray(responseErrors)) {
        const nextErrors: { email?: string; password?: string } = {};
        responseErrors.forEach((message: string) => {
          if (/email/i.test(message)) nextErrors.email = message;
          if (/password/i.test(message)) nextErrors.password = message;
        });
        setErrors(nextErrors);
      }
      toast.error(error?.response?.data?.message || "Login failed.");
    } finally {
      setloading(false);
    }
  }

  return (
    <div className="hotflix-shell flex min-h-screen items-center justify-center px-4 py-6 sm:px-8 lg:py-10">
      <div className="flex w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-surface shadow-2xl lg:flex-row">
        <AuthBrandPanel
          eyebrow="Your next chapter"
          title="Make room for better movie nights."
          description="Discover stories worth staying up late for, then let WatchTV learn what keeps you watching."
        />
      <form
        onSubmit={handlesubmit}
        className="w-full space-y-5 p-7 sm:p-10 lg:w-[54%] lg:p-14"
      >
        <div className="mb-8 text-center"><div className="font-display text-3xl font-extrabold text-primary">WATCH<span className="text-white">TV</span></div><p className="mt-3 text-sm text-muted">Welcome back. Your next story is waiting.</p></div>
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
          {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
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
          {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password}</p>}
        </div>

        <button
          disabled={loading}
          className="w-full rounded bg-primary py-3 font-bold text-black transition hover:bg-white disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-center text-sm">
          <Link to="/forgot-password" className="text-primary hover:text-white hover:underline">
            Forgot password?
          </Link>
        </p>

        <p className="text-center text-sm text-muted">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary hover:text-primary-dark hover:underline">
            Register
          </Link>
        </p>
      </form>
      </div>
    </div>
  );
}