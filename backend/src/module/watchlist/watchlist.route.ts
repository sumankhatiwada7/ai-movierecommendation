import {authorize,authenticate} from "../auth/auth.middleware";
import { Router } from "express";
import{ addtowatchlist,removefromwatchlist,getwatchlist} from "./watchlist.controller";


const router = Router();


router.post("/:tmdbId", authenticate, addtowatchlist);
router.delete("/delete/:tmdbId", authenticate, removefromwatchlist);
router.get("/", authenticate, getwatchlist);

export default router;