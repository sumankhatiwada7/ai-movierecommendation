import {authorize,authenticate} from "../auth/auth.middleware";
import { Router } from "express";
import{logwatch} from "./watch.controller";


const router = Router();

router.post("/:tmdbId", authenticate, logwatch);

export default router;

