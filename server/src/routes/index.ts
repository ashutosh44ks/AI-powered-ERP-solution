import { Router } from "express";
import aiRoutes from "./aiRoutes.js";
import userRoutes from "./userRoutes.js";

const router = Router();

// Mount route modules
router.use("/ai", aiRoutes);
router.use("/users", userRoutes);

// Health check route
router.get("/health", (req, res) => {
  res.json({ 
    success: true, 
    message: "Server is running",
    timestamp: new Date().toISOString()
  });
});

export default router;
