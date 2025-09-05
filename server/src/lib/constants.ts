import { ForbiddenWordsDictionary, Message } from "./types.js";

// Constants
export const PORT = 3001;
export const API_PREFIX = "/api";

// System Prompts
export const THESYS_SYSTEM_PROMPT: Message = {
  // Developer-provided instructions that the model should follow, regardless of messages sent by the user.
  role: "system",
  content: `You are an assistant that takes raw data, such as JSON, and converts it into a summary, a visual chart, and actionable recommendations.

      Guidelines: 
      - If the provided data lacks sufficient structure or content for creating charts and generating meaningful insights, you must return a message indicating that the prompt is not valid.
      - You must output your response in the following order: **Summary** -> **Chart** -> **Recommendations**.
      - You must provide a single visual chart for the data provided. Do NOT return more than one chart.
      - You must provide a summary of the data in bullet points.
      - You must suggest a course of action to improve metrics based on the data if it contains actionable insights.

      Here's a general guide on what chart type to use based on the data and context:
      
      - Radar: Use when comparing multiple variables across different categories in a circular layout.
      - Bar: Use when showing comparisons between discrete categories or items.
      - Pie: Use when illustrating parts of a whole, ideally with few categories.
      - Area: Use when displaying trends over time with an emphasis on cumulative values.
      - Radial: Use when showcasing progress or a single metric in a circular, visually impactful format.
      - Line: Use when showing trends over time or continuous data points.`,
};
const DB_SCHEMA = `- rooms: Contains information about hotel rooms.
  - room_id: Integer, primary key
  - room_number: String, unique room identifier
  - room_type: String, e.g., 'Single', 'Double', 'Suite'
  - price_per_night: Numeric, cost of the room per night
  - max_occupancy: Integer, maximum number of guests allowed
  - is_available: Boolean, indicates if the room can be booked
- customers: Contains information about hotel customers.
  - customer_id: Integer, primary key
  - name: String, full name of the customer
  - email: String, unique email address of the customer
  - created_at: TIMESTAMPTZ, timestamp of when the customer was created
  - updated_at: TIMESTAMPTZ, timestamp of when the customer was last updated
- bookings: Stores reservation details for rooms.
  - booking_id: Integer, primary key
  - customer_id: Integer, foreign key referencing customers
  - room_id: Integer, foreign key referencing rooms
  - check_in_date: TIMESTAMPTZ, start date of the booking
  - check_out_date: TIMESTAMPTZ, end date of the booking
  - total_price: Numeric, calculated cost of the entire booking
  - status: String, e.g., 'Pending', 'Confirmed', 'Cancelled'
- payments: Records payment transactions for bookings.
  - payment_id: Integer, primary key
  - booking_id: Integer, foreign key referencing bookings
  - amount: Numeric, the amount paid
  - payment_method: String, method used for payment
  - transaction_id: String, unique transaction identifier
- guests: Contains information about guests associated with a booking.
  - guest_id: Integer, primary key
  - booking_id: Integer, foreign key referencing bookings
  - first_name: String
  - last_name: String
- amenities: Stores a list of hotel amenities.
  - amenity_id: Integer, primary key
  - name: String, unique name of the amenity
  - description: Text
- room_amenities: Links rooms to their available amenities.
  - room_id: Integer, foreign key referencing rooms
  - amenity_id: Integer, foreign key referencing amenities`;

export const DATABASE_READ_SYSTEM_PROMPT: Message = {
  role: "system",
  content: `
    You are an assistant that helps users interact with a database. Your tasks is to assist with writing SQL queries to get the data necessary for the user prompt.

    Guidelines:
    - You must only return valid SQL queries.
    - You must provide a single SQL query for the user's request.
    - You must not return any other text or explanations.
    - You must ensure that the SQL queries are safe and do not contain any harmful operations.

    Database Schema:
    ${DB_SCHEMA}
  `,
};
// Add below in case auto-incremental ids are not there
// For insertion, you must write a subquery to generate the new id and if it is a batch insertion then generate subsequent ids.
export const DATABASE_UPDATE_SYSTEM_PROMPT: Message = {
  role: "system",
  content: `
    You are an assistant that helps users add and modify records within a database. Your tasks is to assist with writing SQL queries to fulfill user prompt requests.

    Guidelines:
    - You must only return valid SQL queries.
    - You must provide a single SQL query for the user's request.
    - You must not return any other text or explanations.
    - You must ensure that the SQL queries NEVER deletes/truncate any data or modifies the database schema.

    Database Schema:
    ${DB_SCHEMA}
  `,
};

// Dictionaries for aiValidator.js
// Define forbidden words without weights
export const forbiddenSQLQueryKeywordForReadOperations = [
  "DROP",
  "DELETE",
  "TRUNCATE",
  "ALTER",
  "CREATE",
  "INSERT INTO",
  "UPDATE",
  "EXECUTE",
  "--",
  // ";",
  "1=1",
  "0=0",
];
export const forbiddenSQLQueryKeywordForUpdateOperations = [
  "DROP",
  "DELETE",
  "TRUNCATE",
  "ALTER",
  "CREATE",
  // "INSERT INTO",
  // "UPDATE",
  "EXECUTE",
  "--",
  // ";",
  "1=1",
  "0=0",
];
// Define forbidden words with weights (higher = more malicious)
export const forbiddenWordsForReadOperations: ForbiddenWordsDictionary = [
  { word: "SELECT", weight: 5 },
  { word: "INSERT", weight: 5 },
  { word: "UPDATE", weight: 5 },
  { word: "DELETE", weight: 5 },
  { word: "DROP", weight: 10 },
  { word: "ALTER", weight: 8 },
  { word: "CREATE", weight: 7 },
  { word: "EXECUTE", weight: 8 },
  { word: ";", weight: 4 },
  { word: "--", weight: 6 },
  { word: "/*", weight: 6 },
  { word: "*/", weight: 6 },
  // { word: "'", weight: 3 },
  // { word: '"', weight: 3 },
  { word: "`", weight: 3 },
  { word: "OR", weight: 4 },
  { word: "AND", weight: 4 },
  { word: "NOT", weight: 3 },
  { word: "LIKE", weight: 3 },
  { word: "WHERE", weight: 4 },
  { word: "1=1", weight: 7 },
  { word: "0=0", weight: 7 },
  { word: "NULL", weight: 3 },
  { word: "TRUE", weight: 3 },
  { word: "FALSE", weight: 3 },
  { word: "script", weight: 8 },
  { word: "alert", weight: 7 },
  { word: "onerror", weight: 7 },
  { word: "onload", weight: 7 },
  { word: "<script>", weight: 10 },
  { word: "</script>", weight: 10 },
  { word: "<img", weight: 8 },
  { word: "javascript:", weight: 10 },
  { word: "eval", weight: 8 },
  { word: "function", weight: 5 },
  { word: "console", weight: 4 },
  { word: "document", weight: 4 },
];
export const forbiddenWordsForUpdateOperations: ForbiddenWordsDictionary = [
  // { word: "SELECT", weight: 5 },
  // { word: "INSERT", weight: 5 },
  // { word: "UPDATE", weight: 5 },
  { word: "DELETE", weight: 5 },
  { word: "DROP", weight: 10 },
  // { word: "ALTER", weight: 8 },
  // { word: "CREATE", weight: 7 },
  // { word: "EXECUTE", weight: 8 },
  { word: ";", weight: 4 },
  { word: "--", weight: 6 },
  { word: "/*", weight: 6 },
  { word: "*/", weight: 6 },
  // { word: "'", weight: 3 },
  // { word: '"', weight: 3 },
  { word: "`", weight: 3 },
  // { word: "OR", weight: 4 },
  // { word: "AND", weight: 4 },
  // { word: "NOT", weight: 3 },
  // { word: "LIKE", weight: 3 },
  // { word: "WHERE", weight: 4 },
  { word: "1=1", weight: 7 },
  { word: "0=0", weight: 7 },
  // { word: "NULL", weight: 3 },
  // { word: "TRUE", weight: 3 },
  // { word: "FALSE", weight: 3 },
  { word: "script", weight: 8 },
  { word: "alert", weight: 7 },
  { word: "onerror", weight: 7 },
  { word: "onload", weight: 7 },
  { word: "<script>", weight: 10 },
  { word: "</script>", weight: 10 },
  { word: "<img", weight: 8 },
  { word: "javascript:", weight: 10 },
  { word: "eval", weight: 8 },
  { word: "function", weight: 5 },
  { word: "console", weight: 4 },
  { word: "document", weight: 4 },
];

// TABLE RELATED
export const protectedDataModels = ["users", "widgets"]