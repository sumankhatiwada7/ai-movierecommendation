import { subscriptionstatus, paymentstatus } from "@prisma/client";

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
  status: subscriptionstatus;
  startDate: Date;
  endDate: Date;
  providerSubscriptionId: string | null;
}

export interface CreateCheckoutInput {
  planId: string;
}

export interface PaymentRecord {
  id: string;
  userId: string;
  amount: string;
  currency: string;
  status: paymentstatus;
  providerPaymentId: string | null;
}

export interface apiresponse{
  success: boolean;
  message: string;
}

export interface planresponse extends apiresponse {
    data?: SubscriptionPlan[];
}

export interface userSubscriptionresponse extends apiresponse {
    data?: UserSubscription;
}

export interface CheckoutResponse extends apiresponse {
  checkoutUrl: string;
}
