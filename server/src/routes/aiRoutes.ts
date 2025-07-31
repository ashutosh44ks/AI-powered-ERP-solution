import { Router } from "express";
import { generateResponse } from "../controllers/aiController.js";

const router = Router();

// POST /api/ai/generate
router.post("/generate", generateResponse);

export default router;
