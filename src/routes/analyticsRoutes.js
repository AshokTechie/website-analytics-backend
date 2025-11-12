import express from "express";
import { collectEvent, getEventSummary, getUserStats } from "../controllers/analyticsController.js";
import { validateApiKey } from "../middleware/apiKeyAuth.js";

const router = express.Router();

router.post("/collect", validateApiKey, collectEvent);
router.get("/event-summary", validateApiKey, getEventSummary);
router.get("/user-stats", validateApiKey, getUserStats);

export default router;



