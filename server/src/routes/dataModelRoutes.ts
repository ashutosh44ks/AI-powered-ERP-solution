import { Router } from "express";
import {
  getListOfTables,
  getTableConfig,
  getTableData,
} from "../controllers/dataModelController.js";

const router = Router();

// GET /api/data-models
router.get("/", getListOfTables);

// GET /api/data-models/:tableName/config
router.get("/:tableName/config", getTableConfig);

// GET /api/data-models/:tableName/data
router.get("/:tableName/data", getTableData);

export default router;
