import {authorize,authenticate} from "../auth/auth.middleware";
import { Router } from "express";
import{recommendation,similarMovies} from "./recommendation.controller";

const router = Router();

router.get('/', authenticate, recommendation);
router.get('/similar', authenticate, similarMovies);


export default router;