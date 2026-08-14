import {authorize,authenticate} from "../auth/auth.middleware";
import { Router } from "express";
import{getWatchSource, logwatch} from "./watch.controller";


const router = Router();

router.post("/:tmdbId", authenticate, logwatch);
router.get("/watch-source/:tmdbId", authenticate, getWatchSource);


export default router;

