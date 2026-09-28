import {authenticate, activeSubscription} from "../auth/auth.middleware";
import { Router } from "express";
import{recommendation,similarMovies} from "./recommendation.controller";

const router = Router();

router.get('/', authenticate, activeSubscription, recommendation);
router.get('/similar', authenticate, activeSubscription, similarMovies);


export default router;