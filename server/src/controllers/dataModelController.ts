import { Request, Response } from "express";
import * as dataModelService from "../services/dataModelService.js";
import { ApiResponse, ApiResponsePageable, TableConfigBasic } from "../lib/types.js";
import logger from "../config/logger.js";
import { keyToLabel } from "../lib/utils.js";
import { protectedDataModels } from "../lib/constants.js";

// Helper function to handle errors consistently
const handleError = (res: Response, error: unknown, message: string) => {
  logger.error(message, { error });
  const response: ApiResponse = {
    success: false,
    error: error instanceof Error ? error.message : "Unknown error",
  };
  res.status(500).json(response);
};

export const getListOfTables = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const tableList = await dataModelService.getAllTableSchemas();
    const filteredTables = tableList.reduce((acc, curr) => {
      if (!protectedDataModels.includes(curr.table_name))
        acc.push({
          label: keyToLabel(curr.table_name),
          value: curr.table_name,
        });
      return acc;
    }, []);
    const response: ApiResponse<any[]> = {
      success: true,
      data: filteredTables,
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
    if (protectedDataModels.includes(tableName)) {
      res.status(403).json({
        success: false,
        error: "Access to this table is forbidden",
      });
      return;
    }
    const tableConfig: TableConfigBasic[] =
      await dataModelService.getTableConfig(tableName);
    if (!tableConfig || tableConfig.length === 0) {
      res.status(404).json({
        success: false,
        error: "Table configuration not found",
      });
      return;
    }
    const tanstackTableColumnDef = tableConfig.map((column) => ({
      accessorKey: column.column_name,
      header: keyToLabel(column.column_name),
      sqlDataType: column.data_type,
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
    const page = req.query.page;
    const pageNum = isNaN(Number(page)) ? 1 : Number(page);
    if (protectedDataModels.includes(tableName)) {
      res.status(403).json({
        success: false,
        error: "Access to this table is forbidden",
      });
      return;
    }
    const p1 = dataModelService.getTableRowCount(tableName);
    const p2 = dataModelService.getTableData(tableName, pageNum);
    const result = Promise.all([p1, p2]);
    const [totalElements, tableData] = await result;
    const response: ApiResponsePageable = {
      success: true,
      data: {
        content: tableData,
        totalElements: +totalElements,
      },
    };
    res.status(200).json(response);
  } catch (error) {
    handleError(res, error, "Error fetching table data:");
  }
};
