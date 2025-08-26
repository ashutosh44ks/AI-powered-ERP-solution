import { Router } from "express";
import { getDatabaseSchemaDetails } from "../controllers/dataModelController.js";

const router = Router();

// GET /api/data-models
router.get("/", getDatabaseSchemaDetails);

export default router;
