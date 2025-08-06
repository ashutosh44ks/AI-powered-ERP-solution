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
