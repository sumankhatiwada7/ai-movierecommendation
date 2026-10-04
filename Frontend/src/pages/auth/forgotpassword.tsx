import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import AuthBrandPanel from "./components/AuthBrandPanel";
import { checkUserEmail, forgotPassword } from "../../api/authapi";

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"email" | "password">("email");
  const [email, setEmail] = useState("");
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [event.target.name]: event.target.value });
    setErrors((current) => ({ ...current, [event.target.name]: "" }));
  };

  async function findUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!email.trim()) nextErrors.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(email)) nextErrors.email = "Enter a valid email address.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      await checkUserEmail(email.trim());
      setStep("password");
      setErrors({});
    } catch (error: any) {
      setErrors(error?.response?.data?.fieldErrors ?? {});
      toast.error(error?.response?.data?.message || "Unable to find that account.");
    } finally {
      setLoading(false);
    }
  }

  async function updatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!form.oldPassword) nextErrors.oldPassword = "Current password is required.";
    if (!passwordPattern.test(form.newPassword)) {
      nextErrors.newPassword = "Use 8+ characters with uppercase, lowercase, number, and special character.";
    }
    if (!form.confirmPassword) nextErrors.confirmPassword = "Please confirm your new password.";
    else if (form.newPassword !== form.confirmPassword) {
      nextErrors.confirmPassword = "New password and confirmation do not match.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      await forgotPassword({ email, ...form });
      toast.success("Password updated. Please log in with your new password.");
      navigate("/login");
    } catch (error: any) {
      setErrors(error?.response?.data?.fieldErrors ?? {});
      toast.error(error?.response?.data?.message || "Unable to update password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="hotflix-shell flex min-h-screen items-center justify-center px-4 py-6 sm:px-8 lg:py-10">
      <div className="flex w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-surface shadow-2xl lg:flex-row">
        <AuthBrandPanel
          eyebrow="Find your way back"
          title="Keep every movie night going."
          description="Confirm your account, verify your current password, and choose a new password securely."
        />
        <form
          onSubmit={step === "email" ? findUser : updatePassword}
          className="w-full space-y-5 p-7 sm:p-10 lg:w-[54%] lg:p-14"
        >
          <div className="mb-8 text-center">
            <div className="font-display text-3xl font-extrabold text-primary">WATCH<span className="text-white">TV</span></div>
            <p className="mt-3 text-sm text-muted">Update your password securely.</p>
          </div>
          <h1 className="font-display text-xl font-bold text-white">Forgot password</h1>

          {step === "email" ? (
            <>
              <p className="text-sm text-muted">Enter your email to find your account.</p>
              <div>
                <label className="mb-1 block text-sm text-muted">Email</label>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setErrors((current) => ({ ...current, email: "" }));
                  }}
                  className="hotflix-input"
                  autoComplete="email"
                />
                {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
              </div>
              <button type="submit" disabled={loading} className="w-full rounded bg-primary py-3 font-bold text-black transition hover:bg-white disabled:opacity-50">
                {loading ? "Finding account..." : "Continue"}
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-muted">Account found for <span className="text-white">{email}</span>. Enter your current password and choose a new one.</p>
              {(["oldPassword", "newPassword", "confirmPassword"] as const).map((name) => (
                <div key={name}>
                  <label className="mb-1 block text-sm text-muted">
                    {name === "oldPassword" ? "Current password" : name === "newPassword" ? "New password" : "Confirm new password"}
                  </label>
                  <input type="password" name={name} value={form[name]} onChange={handleChange} className="hotflix-input" autoComplete="new-password" />
                  {errors[name] && <p className="mt-1 text-sm text-red-400">{errors[name]}</p>}
                </div>
              ))}
              <button type="submit" disabled={loading} className="w-full rounded bg-primary py-3 font-bold text-black transition hover:bg-white disabled:opacity-50">
                {loading ? "Updating password..." : "Update password"}
              </button>
              <button type="button" onClick={() => { setStep("email"); setErrors({}); }} className="w-full text-sm text-primary hover:text-white hover:underline">
                Use a different email
              </button>
            </>
          )}

          <p className="text-center text-sm text-muted">
            Remember your password?{" "}
            <Link to="/login" className="text-primary hover:text-primary-dark hover:underline">Log in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
