import { Router } from "express";
import { generateUI, saveRecords } from "../controllers/aiController.js";
import multer from "multer";

const router = Router();
// temporary store files in RAM
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/ai/generate-ui
router.post("/generate-ui", generateUI);

// POST /api/ai/save-record
router.post("/save-record", upload.single("file"), saveRecords);

export default router;
