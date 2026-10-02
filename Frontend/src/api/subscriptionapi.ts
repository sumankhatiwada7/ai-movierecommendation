import { api } from "./axios";

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: string;
  durationDays: number;
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  status: string;
  startDate: string;
  endDate: string;
  providerSubscriptionId: string | null;
  plan?: SubscriptionPlan;
}

interface PlansResponse {
  success: boolean;
  message: string;
  data?: SubscriptionPlan[];
}

interface UserSubscriptionResponse {
  success: boolean;
  message: string;
  data?: UserSubscription;
}

interface CheckoutResponse {
  success: boolean;
  message: string;
  checkoutUrl?: string;
}

export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const response = await api.get<PlansResponse>("/subscription/plans");
  return response.data.data ?? [];
}

export async function getUserSubscription(): Promise<UserSubscription | null> {
  try {
    const response = await api.get<UserSubscriptionResponse>("/subscription/user");
    return response.data.data ?? null;
  } catch (error: unknown) {
    const status = (error as { response?: { status?: number } }).response?.status;
    if (status === 404) return null;
    throw error;
  }
}

export async function createCheckoutSession(planId: string): Promise<string> {
  const response = await api.post<CheckoutResponse>("/subscription/checkout", { planId });
  if (!response.data.checkoutUrl) {
    throw new Error(response.data.message || "Checkout could not be started");
  }
  return response.data.checkoutUrl;
}

export async function confirmCheckoutSession(sessionId: string): Promise<void> {
  await api.post("/subscription/confirm", { sessionId });
}
