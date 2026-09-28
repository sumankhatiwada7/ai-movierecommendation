import {authenticate, activeSubscription} from "../auth/auth.middleware";
import { Router } from "express";
import{ logwatch,getwatchpogress,recordwatchprogress,watchpogressbatch,watchhistory} from "./watch.controller";


const router = Router();

router.post("/watchprogress", authenticate, activeSubscription, recordwatchprogress);
router.get("/watchprogress/:tmdbId", authenticate, activeSubscription, getwatchpogress);
router.get("/watchprogressbatch", authenticate, activeSubscription, watchpogressbatch);
router.get("/watchhistory", authenticate, activeSubscription, watchhistory);
router.post("/:tmdbId", authenticate, activeSubscription, logwatch);

export default router;

