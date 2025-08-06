import { Router } from "express";
import { createWidget, getAllWidgets } from "../controllers/widgetController.js";

const router = Router();

// GET /api/widgets
router.get("/", getAllWidgets);

// // GET /api/users/:id
// router.get("/:id", getUserById);

// POST /api/widgets
router.post("/", createWidget);

// // PUT /api/users/:id
// router.put("/:id", updateUser);

// // DELETE /api/users/:id
// router.delete("/:id", deleteUser);

export default router;
