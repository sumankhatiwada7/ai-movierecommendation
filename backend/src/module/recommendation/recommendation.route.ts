import {authorize,authenticate} from "../auth/auth.middleware";
import { Router } from "express";
import{recommendation} from "./recommendation.controller";

const router = Router();

router.post('/', authenticate, recommendation);

export default router;