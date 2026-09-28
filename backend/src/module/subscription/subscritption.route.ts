import {getSubscriptionPlans,getUserSubscription,createCheckoutSession,handleStripeWebhook} from './subscription.controller';
import {Router} from 'express';
import {authenticate} from "../auth/auth.middleware";
const router = Router();

router.get('/plans',getSubscriptionPlans);
router.get('/user',authenticate,getUserSubscription);
router.post('/checkout',authenticate,createCheckoutSession);
router.post('/webhook',handleStripeWebhook);

export default router;