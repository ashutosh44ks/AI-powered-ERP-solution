import { Router } from "express";
import { generateUI, saveRecords } from "../controllers/aiController.js";

const router = Router();

// POST /api/ai/generate-ui
router.post("/generate-ui", generateUI);

// POST /api/ai/save-record
router.post("/save-record", saveRecords);

export default router;
