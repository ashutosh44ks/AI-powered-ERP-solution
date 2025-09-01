import { query } from "../config/db.js";
import { multipleQueryHandler } from "../lib/utils.js";

export const getAllTableSchemas = async (): Promise<any[]> => {
  try {
    const result = await query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_type = 'BASE TABLE'
        AND table_schema NOT IN ('pg_catalog', 'information_schema')  -- exclude system
    `);
    return multipleQueryHandler(result).rows;
  } catch (error) {
    throw new Error(
      `Failed to fetch table schemas: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

export const getTableConfig = async (tableName: string): Promise<any> => {
  try {
    // need to fetch list of all columns and it's type for a given tableName
    const result = await query(
      `SELECT
      column_name,
      data_type
    FROM information_schema.columns
    WHERE table_name = $1`,
      [tableName]
    );
    return multipleQueryHandler(result).rows;
  } catch (error) {
    throw new Error(
      `Failed to fetch table config: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

export const getTableData = async (tableName: string): Promise<any[]> => {
  try {
    const result = await query(
      `SELECT *
      FROM ${tableName}`
    );
    return multipleQueryHandler(result).rows;
  } catch (error) {
    throw new Error(
      `Failed to fetch table data: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};
