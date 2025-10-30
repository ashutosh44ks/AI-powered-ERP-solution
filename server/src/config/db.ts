import { Pool, QueryResult } from 'pg';
import dotenv from 'dotenv';
import { initializeDatabase } from '../lib/utils.js';

dotenv.config();
const { DB_USER, DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT } = process.env;

// Create a new Pool instance for PostgreSQL connections
const pool = new Pool({
    user: DB_USER,
    host: DB_HOST,
    database: DB_NAME,
    password: DB_PASSWORD,
    // Ensure port is parsed as a number
    port: DB_PORT ? parseInt(DB_PORT, 10) : 5432,
});

// Event listener for connection errors
pool.on('error', (err: Error, client: any) => {
    console.error('Unexpected error on idle PostgreSQL client', err);
    // Exit the process to indicate a serious issue
    process.exit(1);
});

/**
 * Executes a SQL query against the PostgreSQL database.
 * @param text The SQL query string.
 * @param params Optional array of query parameters.
 * @returns A Promise that resolves with the query result.
 * @template T The type of the rows in the result.
 * * @example
 * const result = await query<User>('SELECT * FROM users WHERE user_id = $1', [1]);
 * console.log(result.rows); // Array of User objects
 * @throws Will throw an error if the query fails.
 */
export const query = <T extends import('pg').QueryResultRow = import('pg').QueryResultRow>(
    text: string,
    params?: any[]
): Promise<QueryResult<T> | QueryResult<T>[]> => {
    // console.log('Executing query:', text, params || '');
    return pool.query<T>(text, params);
};

console.log('PostgreSQL Pool initialized.');

// Add a simple check to verify connection on startup
// Helpful for debugging initial connection issues.
(async () => {
    try {
        await pool.query('SELECT NOW()');
        console.log('PostgreSQL database connected successfully!');
        await initializeDatabase();
        console.log('PostgreSQL database tables initialized successfully!');
    } catch (err: any) {
        console.error('Failed to connect to PostgreSQL database:', err.message);
        // Do not exit here, as the pool might recover.
        // The 'error' event listener on the pool will handle fatal errors.
    }
})();