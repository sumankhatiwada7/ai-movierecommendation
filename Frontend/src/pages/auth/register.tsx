import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { register } from "../../api/authapi";
import { Link, useNavigate } from "react-router-dom";
import AuthBrandPanel from "./components/AuthBrandPanel";

export const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmpassword: "",
    role: "user",
  });
  const [loading, setloading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors((current) => ({ ...current, [e.target.name]: "" }));
  };

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const nextErrors: Record<string, string> = {};
    if (!form.name.trim()) nextErrors.name = "Name is required.";
    if (!form.email.trim()) nextErrors.email = "Email is required.";
    if (!passwordPattern.test(form.password)) nextErrors.password = "Use 8+ characters with uppercase, lowercase, number, and special character.";
    if (!form.confirmpassword) nextErrors.confirmpassword = "Please confirm your password.";
    else if (form.password !== form.confirmpassword) nextErrors.confirmpassword = "Password and confirm password do not match.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setloading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        confirmpassword: form.confirmpassword,
        role: form.role,
      });
      toast.success("Account created! Please log in, then choose a plan to continue.");
      navigate("/login");
    } catch (error: any) {
      const fieldErrors = error?.response?.data?.fieldErrors;
      if (fieldErrors) setErrors(fieldErrors);
      toast.error(error.response?.data?.message || "An error occurred while registering");
    } finally {
      setloading(false);
    }
  }

  return (
    <div className="hotflix-shell flex min-h-screen items-center justify-center px-4 py-6 sm:px-8 lg:py-10">
      <div className="flex w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-surface shadow-2xl lg:flex-row">
        <AuthBrandPanel
          eyebrow="Start your story"
          title="Build your personal cinema."
          description="Create your account, find a film that hits the mark, and make every recommendation feel like yours."
        />
      <form
        onSubmit={handleSubmit}
        className="w-full p-7 sm:p-10 lg:w-[54%] lg:p-14"
      >
        <div className="mb-8 text-center"><div className="font-display text-3xl font-extrabold text-primary">WATCH<span className="text-white">TV</span></div><p className="mt-3 text-sm text-muted">Make room for better movie nights.</p></div>
        <h1 className="font-display mb-6 text-xl font-bold text-white">
          Create your account
        </h1>

        <div className="mb-4">
          <label className="mb-1 block text-sm text-muted">Name</label>
          <input
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            className="hotflix-input"
            required
          />
          {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm text-muted">Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="hotflix-input"
            required
          />
          {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm text-muted">Password</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            className="hotflix-input"
            required
          />
          {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password}</p>}
        </div>

        <div className="mb-6">
          <label className="mb-1 block text-sm text-muted">Confirm Password</label>
          <input
            name="confirmpassword"
            type="password"
            value={form.confirmpassword}
            onChange={handleChange}
            className="hotflix-input"
            required
          />
          {errors.confirmpassword && <p className="mt-1 text-sm text-red-400">{errors.confirmpassword}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-primary py-3 font-bold text-black transition hover:bg-white disabled:opacity-50"
        >
          {loading ? "Creating Account..." : "Register"}
        </button>

        <p className="mt-4 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:text-primary-dark hover:underline">
            Login
          </Link>
        </p>
      </form>
      </div>
    </div>
  );
};

export default Register;