import {authorize,authenticate} from "../auth/auth.middleware";
import { Router } from "express";
import{ logwatch,getwatchpogress,recordwatchprogress,watchpogressbatch,watchhistory} from "./watch.controller";


const router = Router();

router.post("/:tmdbId", authenticate, logwatch);
router.get("/watchprogress/:tmdbId", authenticate, getwatchpogress);
router.post("/watchprogress", authenticate, recordwatchprogress);
router.get("/watchprogressbatch", authenticate, watchpogressbatch);
router.get("/watchhistory", authenticate, watchhistory);

export default router;

