import {authenticate, activeSubscription} from "../auth/auth.middleware";
import { Router } from "express";
import{ addtowatchlist,removefromwatchlist,getwatchlist} from "./watchlist.controller";


const router = Router();


router.post("/:tmdbId", authenticate, activeSubscription, addtowatchlist);
router.delete("/delete/:tmdbId", authenticate, activeSubscription, removefromwatchlist);
router.get("/", authenticate, activeSubscription, getwatchlist);

export default router;