import { Request, Response } from "express";
import * as dataModelService from "../services/dataModelService.js";
import { ApiResponse, DbSchema } from "../lib/types.js";
import logger from "../config/logger.js";

// Helper function to handle errors consistently
const handleError = (res: Response, error: unknown, message: string) => {
  logger.error(message, { error });
  const response: ApiResponse = {
    success: false,
    error: error instanceof Error ? error.message : "Unknown error",
  };
  res.status(500).json(response);
};

export const getDatabaseSchemaDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const schemaDetails = await dataModelService.getAllTableSchemas();
    const groupedSchemaDetails = schemaDetails.reduce((acc, curr) => {
        if(["users", "widgets"].includes(curr.table_name)) return acc;
      acc[curr.table_name] = acc[curr.table_name] || [];
      acc[curr.table_name].push({
        column_name: curr.column_name,
        data_type: curr.data_type,
        is_nullable: curr.is_nullable,
        character_maximum_length: curr.character_maximum_length,
      });
      return acc;
    }, {} as Record<string, Partial<DbSchema>[]>);
    const response: ApiResponse<Record<string, Partial<DbSchema>[]>> = {
      success: true,
      data: groupedSchemaDetails,
    };
    res.status(200).json(response);
  } catch (error) {
    handleError(res, error, "Error fetching database schema details:");
  }
};
