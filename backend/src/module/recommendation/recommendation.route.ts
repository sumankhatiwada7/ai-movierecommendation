import {authorize,authenticate} from "../auth/auth.middleware";
import { Router } from "express";
import{recommendation,similarMovies} from "./recommendation.controller";

const router = Router();

router.get('/recommendation/:userId', authenticate, recommendation);
router.get('/recommendation/similar/:movieId', authenticate, similarMovies);


export default router;