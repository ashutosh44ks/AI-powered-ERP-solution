import { NextFunction, Request, Response } from "express";

export const authMiddleWare = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Check if the user is authenticated
  const USER_ID = req.headers["x-user-id"];
    if (!USER_ID) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }
  if (typeof USER_ID === "string") {
    req.USER_ID = USER_ID; // Attach user ID to request object
  }
  next(); // Pass control to the next middleware
};
