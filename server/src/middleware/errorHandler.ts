import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../lib/types.js";

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const response: ApiResponse = {
    success: false,
    error: `Route ${req.originalUrl} not found`
  };
  res.status(404).json(response);
};


// General Error handling middleware (must be last)
// Express recognizes this as an error handler because of the 'err' argument
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error("Unhandled error:", error);

  const response: ApiResponse = {
    success: false,
    error: process.env.NODE_ENV === "production" 
      ? "Internal server error" 
      : error.message
  };

  res.status(500).json(response);
};