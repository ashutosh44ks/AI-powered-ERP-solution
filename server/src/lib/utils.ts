import { QueryResult, QueryResultRow } from "pg";
import { query } from "../config/db.js";
import xlsx from "xlsx";

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

export const extractDataFromFile = (
  file: Buffer<ArrayBufferLike>,
  mimetype: string | undefined
) => {
  const result: {
    data: any;
    isSuccess: boolean;
    error: string;
  } = {
    data: null,
    isSuccess: false,
    error: "",
  };
  try {
    if (!mimetype) {
      throw new Error("MIME type is required");
    }
    switch (mimetype) {
      case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        const workbook = xlsx.read(file, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = xlsx.utils.sheet_to_json(sheet);
        result.data = jsonData;
        result.isSuccess = true;
        break;
      case "text/csv":
        // const csvData = file.toString("utf-8");
        // result.data = csvData.split("\n").map((row) => row.split(","));
        const workbook2 = xlsx.read(file, { type: "buffer" });
        const sheetName2 = workbook2.SheetNames[0];
        const sheet2 = workbook2.Sheets[sheetName2];
        const jsonData2 = xlsx.utils.sheet_to_json(sheet2);
        result.data = jsonData2;
        result.isSuccess = true;
        break;
      case "application/json":
        result.data = JSON.parse(file.toString("utf-8"));
        result.isSuccess = true;
        break;
      default:
        result.error = "Unsupported file type.";
    }
  } catch (error) {
    console.error("Error extracting data:", error);
    result.error = error instanceof Error ? error.message : "Unknown error";
  }
  return result;
};
export const multipleQueryHandler = <T extends QueryResultRow>(
  result: QueryResult<T> | QueryResult<T>[]
): QueryResult<T> => {
  if (Array.isArray(result)) {
    return {
      command: "MULTIPLE",
      rowCount: result.reduce((acc, res) => acc + (res.rowCount || 0), 0),
      rows: result.flatMap((res) => res.rows),
      fields: result.flatMap((res) => res.fields),
      oid: result[result.length - 1]?.oid || 0,
    };
  } else {
    return result;
  }
};

export const keyToLabel = (key: string) => {
  return key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
};