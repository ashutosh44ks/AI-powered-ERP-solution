import { query } from "../db.js";
import { Widget } from "../lib/types.js";

export const getAllWidgets = async (userId: string): Promise<Widget[]> => {
  try {
    const result = await query<Widget>("SELECT * FROM widgets WHERE user_id = $1", [userId]);
    return result.rows;
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
    return result.rows[0];
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
    if (result.rows.length === 0) {
      throw new Error("Widget not found");
    }
    return result.rows[0];
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
      "SELECT * FROM widgets WHERE id = $1 AND user_id = $2",
      [widgetId, userId]
    );
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    throw new Error(`Failed to fetch widget: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};