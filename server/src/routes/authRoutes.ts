import { Router } from "express";
import { createUser, getUserByEmail } from "../controllers/userController.js";

const router = Router();

// FAKE auth controllers for testing purposes

// POST /api/auth/login
router.post("/login", getUserByEmail);

// POST /api/auth/register
router.post("/register", createUser);

export default router;
