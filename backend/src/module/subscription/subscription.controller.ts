import type { planresponse,apiresponse, userSubscriptionresponse, CheckoutResponse } from "./subscription.type";
import { subscriptionservice } from "./subscription.service";
import { Request,Response } from "express";
import { AuthenticatedRequest } from "../auth/auth.middleware";
import {stripe} from "../../core/payment/stripe.config";
import {prisma} from "../../core/database/prisma";
import { Stripe } from "stripe";


export async function getSubscriptionPlans(req:Request,res:Response){
    try{
    const plan = await new subscriptionservice().getSubscriptionplan();
    if(!plan){
        const payload:planresponse={
            message:"No subscription plans found",
            success:false,
        }
        return res.status(404).json(payload);
    }
    const payload:planresponse={
        message:"Subscription plans fetched successfully",
        success:true,
        data: plan.map((subscriptionPlan) => ({
            ...subscriptionPlan,
            price: subscriptionPlan.price.toString(),
        }))
    }
    return res.status(200).json(payload);
    }
    catch(error){
        const payload:apiresponse={
            message:"Internal server error",
            success:false
        }
        return res.status(500).json(payload);
    }
}

export async function getUserSubscription(req:AuthenticatedRequest,res:Response){
    try{
        const userId = req.user?.id;
       if(!userId){
            const payload:apiresponse={
                message:"User not found",
                success:false
            }
            return res.status(404).json(payload);
        }
    const subscription = await new subscriptionservice().getUserSubscription(userId);
    if(!subscription){
        const payload:userSubscriptionresponse={
            message:"No active subscription found",
            success:false
        }
        return res.status(404).json(payload);
    }
    const payload:userSubscriptionresponse={
        message:"User subscription fetched successfully",
        success:true,
        data:subscription
    }
    return res.status(200).json(payload);
    }
    catch(error){
        const payload:apiresponse={
            message:"Internal server error",
            success:false
        }
        return res.status(500).json(payload);
    }
}

export async function createCheckoutSession(req:AuthenticatedRequest,res:Response){
    try{
    const userId = req.user?.id;
    if(!userId){
        const payload:apiresponse={
            message:"User not found",
            success:false
        }
        return res.status(404).json(payload);
    }
    const {planId} = req.body;
    if(!planId){
        const payload:apiresponse={
            message:"Plan id is required",
            success:false
        }
        return res.status(400).json(payload);
    }
    const checkout = await new subscriptionservice().createcheckoutSession(userId,planId);
    if(!checkout || !checkout.checkoutUrl){
        const payload:apiresponse={
            message:"Checkout session creation failed",
            success:false
        }
        return res.status(500).json(payload);
    }
    const payload:CheckoutResponse={
        message:"Checkout session created successfully",
        success:true,
        checkoutUrl:checkout.checkoutUrl
    }
    return res.status(200).json(payload);
    }
    catch(error){
        const payload:apiresponse={
            message:"Internal server error",
            success:false
        }
        return res.status(500).json(payload);
    }
}

export async function handleStripeWebhook(req:Request,res:Response){
    
   const sig = req.headers['stripe-signature'] as string;
   if(!sig){
    const payload:apiresponse={
        message:"Stripe signature is missing",
        success:false
    }
    return res.status(400).json(payload);
}
let event;
try{
    event = stripe.webhooks.constructEvent(req.body,sig,process.env.STRIPE_WEBHOOK_SECRET as string);

}catch(error){
    console.error("Error verifying stripe webhook signature:", error);
   const payload:apiresponse={
    message:"Invalid stripe signature",
    success:false
   }
   return res.status(400).json(payload);
}
  try{
    switch(event.type){
        case 'checkout.session.completed':
            {
                const session = event.data.object ;
                const userId=session.metadata?.userId;
                const planId=session.metadata?.planId;

                if(!userId || !planId){
                    console.error("User id or plan id is missing in stripe webhook metadata");
                    const payload:apiresponse={
                        message:"User id or plan id is missing in stripe webhook metadata",
                        success:false
                    }
                    return res.status(400).json(payload);
                }
                const existingpayment= session.payment_intent ? await prisma.payment.findUnique({
                    where:{
                        providerPaymentId:session.payment_intent as string
                    }
                }): null;
                if(existingpayment){
                    console.log("Payment already exists in the database, skipping creation");
                    const payload:apiresponse={
                        message:"Payment already exists in the database, skipping creation",
                        success:true
                    }
                    return res.status(200).json(payload);
                }
              const plan = await prisma.plan.findUnique({
                where:{id:planId}
              });
              if(!plan){
                console.error("Plan not found in the database");
                const payload:apiresponse={
                    message:"Plan not found in the database",
                    success:false
                }
                return res.status(404).json(payload);
              }
              const paymentIntentId = session.payment_intent as string;
              const startDate = new Date();
              const endDate = new Date(startDate);
              endDate.setDate(endDate.getDate() + plan.durationDays);
              await prisma.$transaction(async (prisma) => {
                await prisma.payment.create({
                  data: {
                   userId,
                   amount: plan.price,
                   currency: "USD",
                   status: session.payment_status as any,
                   providerPaymentId:paymentIntentId,
                  }
                });
              });
              await prisma.subscription.create({
                data:{
                    userId,
                    planId,
                    status:"active",
                    startDate,
                    endDate,
                }
              })
               console.log("Stripe webhook handled successfully");
               break;
            }
           default:
            
                console.log(`Unhandled event type ${event.type}`);
                break;
            }
            const payload:apiresponse={
                message:'webhook handled successfully',
                success:true
            }
            return res.status(200).json(payload);
        }
        catch(error){
            console.error("Error handling stripe webhook:", error);
            const payload:apiresponse={
                message:"Error handling stripe webhook",
                success:false
            }
            return res.status(500).json(payload);
        }
    }
