import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  generateSmartReplies,
  polishMessage,
  summarizeConversation,
  chatWithNova,
} from "../controllers/ai.controller.js";

const router = express.Router();

router.post("/smart-replies", protectRoute, generateSmartReplies);
router.post("/polish", protectRoute, polishMessage);
router.post("/summarize", protectRoute, summarizeConversation);
router.post("/chat", protectRoute, chatWithNova);

export default router;
