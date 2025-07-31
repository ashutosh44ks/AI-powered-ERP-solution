import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import routes from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { PORT, API_PREFIX } from "./config/constants.js";

// Load environment variables
dotenv.config();

const app: Application = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.get("/", (req: Request, res: Response) => {
  res.json({ 
    success: true, 
    message: "AI Dashboard API Server",
    version: "1.0.0"
  });
});

// API routes
app.use(API_PREFIX, routes);

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
