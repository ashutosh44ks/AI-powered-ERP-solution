import { query } from "../config/db.js";
import { DbSchema } from "../lib/types.js";
import { multipleQueryHandler } from "../lib/utils.js";

export const getAllTableSchemas = async (): Promise<DbSchema[]> => {
  try {
    const result = await query<DbSchema>(`SELECT 
    t.table_schema,
    t.table_name,
    c.column_name,
    c.data_type,
    c.is_nullable,
    c.character_maximum_length
FROM information_schema.tables t
JOIN information_schema.columns c 
    ON t.table_schema = c.table_schema 
   AND t.table_name = c.table_name
WHERE t.table_type = 'BASE TABLE'
  AND t.table_schema NOT IN ('pg_catalog', 'information_schema')  -- exclude system
ORDER BY t.table_schema, t.table_name, c.ordinal_position;
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
