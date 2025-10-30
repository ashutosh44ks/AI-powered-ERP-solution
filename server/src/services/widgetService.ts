import { query } from "../config/db.js";
import { Widget } from "../lib/types.js";
import { multipleQueryHandler } from "../lib/utils.js";

export const getAllWidgets = async (userId: string): Promise<Widget[]> => {
  try {
    const result = await query<Widget>(
      "SELECT * FROM widgets WHERE user_id = $1 AND is_deleted = false",
      [userId]
    );
    return multipleQueryHandler(result).rows;
  } catch (error) {
    throw new Error(
      `Failed to fetch widgets: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

export const createWidget = async (prompt: string, userId: string): Promise<Widget> => {
  try {
    const result = await query<Widget>(
      "INSERT INTO widgets (prompt, user_id) VALUES ($1, $2) RETURNING *",
      [prompt, userId]
    );
    return multipleQueryHandler(result).rows[0];
  } catch (error) {
    throw new Error(`Failed to create widget: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const updateWidget = async (
  widgetId: Widget["id"],
  sql_query: Widget["sql_query"],
  content: Widget["content"],
  userId: string
): Promise<Widget> => {
  try {
    const result = await query<Widget>(
      "UPDATE widgets SET sql_query = $1, content = $2 WHERE id = $3 AND user_id = $4 RETURNING *",
      [sql_query, content, widgetId, userId]
    );
    if (multipleQueryHandler(result).rows.length === 0) {
      throw new Error("Widget not found");
    }
    return multipleQueryHandler(result).rows[0];
  } catch (error) {
    throw new Error(`Failed to update widget: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const getWidgetById = async (
  widgetId: Widget["id"],
  userId: string
): Promise<Widget | null> => {
  try {
    const result = await query<Widget>(
      "SELECT * FROM widgets WHERE id = $1 AND user_id = $2 AND is_deleted = false",
      [widgetId, userId]
    );
    return multipleQueryHandler(result).rows.length > 0 ? multipleQueryHandler(result).rows[0] : null;
  } catch (error) {
    throw new Error(`Failed to fetch widget: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const deleteWidget = async (
  widgetId: Widget["id"],
  userId: string
): Promise<void> => {
  try {
    const result = await query(
      "UPDATE widgets SET is_deleted = true WHERE id = $1 AND user_id = $2",
      [widgetId, userId]
    );
    if (multipleQueryHandler(result).rowCount === 0) {
      throw new Error("Widget not found or not owned by user");
    }
  } catch (error) {
    throw new Error(`Failed to delete widget: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};