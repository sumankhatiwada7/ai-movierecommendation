import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey || !stripeSecretKey.startsWith('sk_')) {
	throw new Error('STRIPE_SECRET_KEY must be a Stripe secret key starting with sk_.');
}

const stripe: Stripe = new Stripe(stripeSecretKey);

export{stripe}