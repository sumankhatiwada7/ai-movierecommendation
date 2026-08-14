import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { register } from "../../api/authapi";
import { Link, useNavigate } from "react-router-dom";

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (form.password !== form.confirmpassword) {
      toast.error("Password and confirm password do not match");
      return;
    }

    setloading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      });
      toast.success("Account created! Please log in.");
      navigate("/login");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "An error occurred while registering");
    } finally {
      setloading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl bg-surface border border-edge p-8 shadow-lg"
      >
        <h1 className="font-display mb-6 text-center text-3xl font-bold text-ink">
          Create Account
        </h1>

        <div className="mb-4">
          <label className="mb-1 block text-sm text-muted">Name</label>
          <input
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            className="w-full rounded-lg border border-edge bg-bg p-2 text-ink outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
            required
          />
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm text-muted">Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="w-full rounded-lg border border-edge bg-bg p-2 text-ink outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
            required
          />
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm text-muted">Password</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            className="w-full rounded-lg border border-edge bg-bg p-2 text-ink outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
            required
          />
        </div>

        <div className="mb-6">
          <label className="mb-1 block text-sm text-muted">Confirm Password</label>
          <input
            name="confirmpassword"
            type="password"
            value={form.confirmpassword}
            onChange={handleChange}
            className="w-full rounded-lg border border-edge bg-bg p-2 text-ink outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-primary py-2.5 font-semibold text-bg hover:bg-primary-dark disabled:opacity-50 transition"
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
  );
};

export default Register;