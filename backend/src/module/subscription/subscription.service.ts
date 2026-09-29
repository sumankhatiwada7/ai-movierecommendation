import {prisma} from "../../core/database/prisma";
import { stripe } from "../../core/payment/stripe.config";


export class subscriptionservice {
   async getSubscriptionplan(){
    return prisma.plan.findMany({
       orderBy:{
        price:"asc",
       },
    });
   }

  async getUserSubscription(userId:string){
    return prisma.subscription.findFirst({
        where:{
            userId,
            status:"active",
            endDate:{
                gt:new Date(),
            },
        },
        include:{
            plan:true,

        },
        orderBy:{
            endDate:"desc",
        },
  })

}


async createcheckoutSession(userId:string,planId:string){
    const plan = await prisma.plan.findUnique({
        where:{
            id:planId
        }
    })
    if(!plan){
        throw new Error("Plan not found");
    }
   const user=  await prisma.user.findUnique({
    where:{
        id:userId
    }
    
   })
   if(!user){
        throw new Error("User not found");
    }
   const activeSubscription = await this.getUserSubscription(userId);
   if(activeSubscription){
    throw new Error("User already has an active subscription");
   }
   //this part creating the stripe customer
   let customerid= user.stripeCustomerId;
   if(!customerid){
    const customer = await stripe.customers.create({
        name:user.name,
        email:user.email,
        metadata:{
            userId:userId
        }
    })
    customerid= customer.id;
    await prisma.user.update({
        where:{ id:userId },
        data:{
            stripeCustomerId:customerid
        },
    })

   }

   const amount =Math.round(Number(plan.price)*100);

   //creating the stripe checkout session for the subscription
  const session = await stripe.checkout.sessions.create({
    mode:"payment",
    customer:customerid,
    line_items:[{
        price_data:{
            currency:"usd",
            product_data:{
                name:plan.name,
                description:`${plan.durationDays} days subscription`,
            },
            unit_amount:amount,
        },
        quantity:1,
    }],
    metadata:{
        userId:userId,
        planId:planId,},
    success_url:`${process.env.FRONTEND_URL ?? process.env.CLIENT_URL}/subscription/success`,
    cancel_url:`${process.env.FRONTEND_URL ?? process.env.CLIENT_URL}/subscription/cancel`,



  })
  return {
    checkoutUrl:session.url
  }
   

}

}