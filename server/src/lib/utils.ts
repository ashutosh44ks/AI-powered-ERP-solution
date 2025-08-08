import { query } from "../config/db.js";

const createWidgetsTableIfNotExists = async (): Promise<void> => {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS widgets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        prompt TEXT NOT NULL,
        content TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        CONSTRAINT fk_user
            FOREIGN KEY(user_id)
                REFERENCES users(id)
                ON DELETE CASCADE
        );
    `);
  } catch (error) {
    throw new Error(
      `Failed to create widgets table: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

const createUsersTableIfNotExists = async (): Promise<void> => {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
  } catch (error) {
    throw new Error(
      `Failed to create users table: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

export const initializeDatabase = async (): Promise<void> => {
  try {
    await createWidgetsTableIfNotExists();
    await createUsersTableIfNotExists();
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error; // Re-throw to handle it in the calling context
  }
};
