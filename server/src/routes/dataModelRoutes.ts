import { Router } from "express";
import {
  getDatabaseSchemaDetails,
  getTableConfig,
  getTableData,
} from "../controllers/dataModelController.js";

const router = Router();

// GET /api/data-models
router.get("/", getDatabaseSchemaDetails);

// GET /api/data-models/:tableName/config
router.get("/:tableName/config", getTableConfig);

// GET /api/data-models/:tableName/data
router.get("/:tableName/data", getTableData);

export default router;
