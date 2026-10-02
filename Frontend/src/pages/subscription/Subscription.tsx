import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { toast } from "sonner";
import {
  createCheckoutSession,
  confirmCheckoutSession,
  getSubscriptionPlans,
  getUserSubscription,
  type SubscriptionPlan,
  type UserSubscription,
} from "../../api/subscriptionapi";

function formatPrice(price: string) {
  return Number(price).toFixed(2);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value));
}

export default function Subscription() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutPlanId, setCheckoutPlanId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getSubscriptionPlans(), getUserSubscription()])
      .then(([availablePlans, currentSubscription]) => {
        setPlans(availablePlans);
        setSubscription(currentSubscription);
      })
      .catch(() => toast.error("Unable to load subscription plans."))
      .finally(() => setLoading(false));
  }, []);

  const startCheckout = async (plan: SubscriptionPlan) => {
    setCheckoutPlanId(plan.id);
    try {
      const checkoutUrl = await createCheckoutSession(plan.id);
      window.location.assign(checkoutUrl);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unable to start checkout.";
      toast.error(message);
      setCheckoutPlanId(null);
    }
  };

  return (
    <div className="hotflix-shell min-h-screen pb-20 text-white">
      <main className="page-width pt-12 md:pt-16">
        <div className="max-w-2xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[.28em] text-primary">WatchTV membership</p>
          <h1 className="font-display text-4xl font-extrabold tracking-tight md:text-6xl">Choose your movie night.</h1>
          <p className="mt-5 text-base leading-7 text-muted">Unlock the full WatchTV catalog with a simple, flexible pass.</p>
        </div>

        {subscription && (
          <section className="mt-10 flex flex-col justify-between gap-5 rounded-md border border-primary/30 bg-primary/10 p-5 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.2em] text-primary">Active subscription</p>
              <h2 className="mt-2 font-display text-xl font-bold text-white">{subscription.plan?.name || "WatchTV plan"}</h2>
              <p className="mt-1 text-sm text-muted">Active until {formatDate(subscription.endDate)}</p>
            </div>
            <span className="rounded-full bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-black">Active</span>
          </section>
        )}

        <section className="mt-12">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.2em] text-primary">Plans</p>
              <h2 className="mt-2 font-display text-2xl font-extrabold">Find your fit</h2>
            </div>
            <span className="hidden text-xs text-muted sm:block">Secure checkout by Stripe</span>
          </div>

          {loading ? (
            <div className="grid gap-5 md:grid-cols-3">
              {[1, 2, 3].map((item) => <div key={item} className="h-72 animate-pulse rounded-md bg-surface" />)}
            </div>
          ) : plans.length === 0 ? (
            <p className="rounded-md border border-dashed border-white/10 py-16 text-center text-muted">No plans are available right now.</p>
          ) : (
            <div className="grid gap-5 md:grid-cols-3">
              {plans.map((plan, index) => {
                const isCurrent = subscription?.planId === plan.id;
                return (
                  <article key={plan.id} className={`relative flex min-h-80 flex-col rounded-md border p-6 ${index === 1 ? "border-primary bg-primary/10" : "border-white/10 bg-surface"}`}>
                    {index === 1 && <span className="absolute right-5 top-5 rounded-full bg-primary px-3 py-1 text-[.65rem] font-bold uppercase tracking-wider text-black">Popular</span>}
                    <p className="text-xs font-bold uppercase tracking-[.2em] text-primary">{plan.durationDays} days</p>
                    <h3 className="mt-4 font-display text-2xl font-extrabold text-white">{plan.name}</h3>
                    <div className="mt-6 flex items-baseline gap-1"><span className="font-display text-4xl font-extrabold">${formatPrice(plan.price)}</span><span className="text-sm text-muted">total</span></div>
                    <p className="mt-3 text-sm leading-6 text-muted">Full access to movies, personalized picks, watch history, and playback.</p>
                    <button
                      type="button"
                      disabled={Boolean(subscription) || checkoutPlanId !== null}
                      onClick={() => startCheckout(plan)}
                      className="mt-auto rounded bg-primary px-4 py-3 text-sm font-bold text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {isCurrent ? "Current plan" : checkoutPlanId === plan.id ? "Opening checkout..." : subscription ? "Unavailable" : "Choose plan"}
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export function SubscriptionResult() {
  const location = useLocation();
  const cancelled = location.pathname.endsWith("/cancel");
  const sessionId = new URLSearchParams(location.search).get("session_id");
  const [confirming, setConfirming] = useState(!cancelled && Boolean(sessionId));
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (cancelled || !sessionId) return;
    confirmCheckoutSession(sessionId)
      .then(() => setConfirmed(true))
      .catch(() => toast.error("Payment received, but confirmation is still processing. Please check your subscription shortly."))
      .finally(() => setConfirming(false));
  }, [cancelled, sessionId]);

  return (
    <div className="hotflix-shell flex min-h-[calc(100vh-88px)] items-center justify-center px-4 text-center text-white">
      <div className="max-w-lg">
        <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full text-3xl ${cancelled ? "bg-white/10 text-muted" : "bg-primary text-black"}`}>
          {cancelled ? "×" : "✓"}
        </div>
        <p className="mt-6 text-xs font-bold uppercase tracking-[.28em] text-primary">WatchTV membership</p>
        <h1 className="mt-3 font-display text-4xl font-extrabold">{cancelled ? "Checkout cancelled" : "Welcome to WatchTV"}</h1>
        <p className="mt-4 leading-7 text-muted">
          {cancelled
            ? "No payment was taken. You can return whenever you are ready."
            : confirming
              ? "Confirming your payment securely..."
              : confirmed
                ? "Your subscription is active. Enjoy WatchTV."
                : "Your payment was received and is being confirmed. Please check your subscription shortly."}
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/" className="rounded bg-primary px-5 py-3 text-sm font-bold text-black transition hover:bg-white">Back to home</Link>
          {cancelled && <Link to="/subscription" className="rounded border border-white/15 px-5 py-3 text-sm font-bold text-white transition hover:border-primary hover:text-primary">View plans</Link>}
        </div>
      </div>
    </div>
  );
}
