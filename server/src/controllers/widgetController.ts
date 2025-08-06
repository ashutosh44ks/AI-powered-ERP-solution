import { Request, Response } from "express";
import * as widgetService from "../services/widgetService.js";
import { ApiResponse, Widget } from "../lib/types.js";

// Helper function to handle errors consistently
const handleError = (res: Response, error: unknown, message: string) => {
  console.error(message, error);
  const response: ApiResponse = {
    success: false,
    error: error instanceof Error ? error.message : "Unknown error",
  };
  res.status(500).json(response);
};

export const getAllWidgets = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const USER_ID = req.USER_ID;
    if (!USER_ID) {
      const response: ApiResponse = {
        success: false,
        error: "User ID is required",
      };
      res.status(400).json(response);
      return;
    }
    const widgets = await widgetService.getAllWidgets(USER_ID);
    const response: ApiResponse<Widget[]> = {
      success: true,
      data: widgets,
    };
    res.status(200).json(response);
  } catch (error) {
    handleError(res, error, "Error fetching widgets:");
  }
};

export const createWidget = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { prompt } = req.body;
    const USER_ID = req.USER_ID;

    if (!prompt) {
      const response: ApiResponse = {
        success: false,
        error: "Prompt is required",
      };
      res.status(400).json(response);
      return;
    }

    if (!USER_ID) {
      const response: ApiResponse = {
        success: false,
        error: "User ID is required",
      };
      res.status(400).json(response);
      return;
    }

    const widget = await widgetService.createWidget(prompt, USER_ID);
    const response: ApiResponse<Widget> = {
      success: true,
      data: widget,
      message: "Widget created successfully",
    };
    res.status(201).json(response);
  } catch (error) {
    handleError(res, error, "Error creating widget:");
  }
};
