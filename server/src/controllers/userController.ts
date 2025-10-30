import { Request, Response } from "express";
import * as userService from "../services/userService.js";
import { ApiResponse, User } from "../lib/types.js";
import logger from "../config/logger.js";

// Helper function to handle errors consistently
const handleError = (res: Response, error: unknown, message: string) => {
  logger.error(message, { error });
  const response: ApiResponse = {
    success: false,
    error: error instanceof Error ? error.message : "Unknown error"
  };
  res.status(500).json(response);
};

// Helper function to validate user ID
const validateUserId = (id: string): number | null => {
  const parsedId = parseInt(id);
  return isNaN(parsedId) ? null : parsedId;
};

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await userService.getAllUsers();
    const response: ApiResponse<User[]> = {
      success: true,
      data: users
    };
    res.status(200).json(response);
  } catch (error) {
    handleError(res, error, "Error fetching users:");
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const user_id = validateUserId(req.params.user_id);
    if (user_id === null) {
      const response: ApiResponse = {
        success: false,
        error: "Invalid user ID"
      };
      res.status(400).json(response);
      return;
    }

    const user = await userService.getUserById(user_id);
    if (!user) {
      const response: ApiResponse = {
        success: false,
        error: "User not found"
      };
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse<User> = {
      success: true,
      data: user
    };
    res.status(200).json(response);
  } catch (error) {
    handleError(res, error, "Error fetching user:");
  }
};

export const getUserByEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const email = req.params.email || req.body.email;
    if (!email) {
      const response: ApiResponse = {
        success: false,
        error: "Invalid email"
      };
      res.status(400).json(response);
      return;
    }

    const user = await userService.getUserByEmail(email);
    if (!user) {
      const response: ApiResponse = {
        success: false,
        error: "User not found"
      };
      res.status(404).json(response);
      return;
    }
    logger.info(`User found: ${user.name} (${user.email})`);
    const response: ApiResponse<User> = {
      success: true,
      data: user
    };
    res.status(200).json(response);
  } catch (error) {
    handleError(res, error, "Error fetching user:");
  }
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email } = req.body;
    
    if (!name || !email) {
      const response: ApiResponse = {
        success: false,
        error: "Name and email are required"
      };
      res.status(400).json(response);
      return;
    }

    const user = await userService.createUser(name, email);
    logger.info(`User created: ${user.name} (${user.email})`);
    const response: ApiResponse<User> = {
      success: true,
      data: user,
      message: "User created successfully"
    };
    res.status(201).json(response);
  } catch (error) {
    handleError(res, error, "Error creating user:");
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user_id = validateUserId(req.params.user_id);
    if (user_id === null) {
      const response: ApiResponse = {
        success: false,
        error: "Invalid user ID"
      };
      res.status(400).json(response);
      return;
    }

    const { name, email } = req.body;
    const user = await userService.updateUser(user_id, name, email);
    
    if (!user) {
      const response: ApiResponse = {
        success: false,
        error: "User not found"
      };
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse<User> = {
      success: true,
      data: user,
      message: "User updated successfully"
    };
    res.status(200).json(response);
  } catch (error) {
    handleError(res, error, "Error updating user:");
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user_id = validateUserId(req.params.user_id);
    if (user_id === null) {
      const response: ApiResponse = {
        success: false,
        error: "Invalid user ID"
      };
      res.status(400).json(response);
      return;
    }

    const deleted = await userService.deleteUser(user_id);
    if (!deleted) {
      const response: ApiResponse = {
        success: false,
        error: "User not found"
      };
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse = {
      success: true,
      message: "User deleted successfully"
    };
    res.status(200).json(response);
  } catch (error) {
    handleError(res, error, "Error deleting user:");
  }
};
