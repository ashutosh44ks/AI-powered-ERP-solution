import { Request, Response } from "express";
import * as dataModelService from "../services/dataModelService.js";
import { ApiResponse, DbSchema, TableConfigBasic } from "../lib/types.js";
import logger from "../config/logger.js";
import { keyToLabel } from "../lib/utils.js";

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
      if (["users", "widgets"].includes(curr.table_name)) return acc;
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

export const getTableConfig = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { tableName } = req.params;
    const tableConfig: TableConfigBasic[] =
      await dataModelService.getTableConfig(tableName);
    if (!tableConfig) {
      res.status(404).json({
        success: false,
        error: "Table configuration not found",
      });
      return;
    }
    const tanstackTableColumnDef = tableConfig.map((column) => ({
      accessorKey: column.column_name,
      header: keyToLabel(column.column_name),
      sqlDataType: column.data_type
    }));
    const response: ApiResponse = {
      success: true,
      data: tanstackTableColumnDef,
    };
    res.status(200).json(response);
  } catch (error) {
    handleError(res, error, "Error fetching table configuration:");
  }
};

export const getTableData = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { tableName } = req.params;
    const tableData = await dataModelService.getTableData(tableName);
    if (!tableData) {
      res.status(404).json({
        success: false,
        error: "Table data not found",
      });
      return;
    }
    const response: ApiResponse = {
      success: true,
      data: tableData,
    };
    res.status(200).json(response);
  } catch (error) {
    handleError(res, error, "Error fetching table data:");
  }
};
