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

export const getTableData = async (
  tableName: string,
  page: number
): Promise<any[]> => {
  try {
    const PAGE_SIZE = 10;
    const result = await query(
      `SELECT *
      FROM ${tableName}
      LIMIT $1 OFFSET $2`,
      [PAGE_SIZE, page * PAGE_SIZE]
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
export const getTableRowCount = async (tableName: string): Promise<number> => {
  try {
    const result = await query(
      `SELECT COUNT(*) as count
      FROM ${tableName}`
    );
    return multipleQueryHandler(result).rows[0].count;
  } catch (error) {
    throw new Error(
      `Failed to fetch table row count: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};
