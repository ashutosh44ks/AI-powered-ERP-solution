# Database Schema for AI Dashboard POC
This document outlines the PostgreSQL schema for the Proof of Concept (POC) AI-powered dashboard. The schema consists of two main tables: users and widgets.

## users Table
The users table is the central point for user authentication and management.

### Purpose: To store user login information and act as the primary key for associating widgets.

### Columns:

id: A unique, auto-incrementing integer serving as the primary key.

username: A unique string for user login.

created_at: A timestamp with time zone, automatically set upon creation.

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

## widgets Table
The widgets table stores the individual components of each user's dashboard.

### Purpose: To store the user's prompt, the generated content from the AI model, and to link each widget back to a specific user.

### Columns:

id: A unique, auto-incrementing integer serving as the primary key.

user_id: A foreign key that references the id column in the users table. This is the crucial link that ties a widget to a user.

prompt: A text field to store the user's input prompt.

content: A text field to store the AI-generated output, which will be rendered as UI.

created_at: A timestamp with time zone, automatically set upon creation.

### Constraints:

CONSTRAINT fk_user: A foreign key constraint that ensures every widget belongs to a valid user. ON DELETE CASCADE means that if a user is deleted, all their associated widgets will also be automatically removed.

CREATE TABLE widgets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    prompt TEXT NOT NULL,
    sql_query TEXT,
    content TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_user
        FOREIGN KEY(user_id)
            REFERENCES users(id)
            ON DELETE CASCADE
);

## Sample Data
These commands demonstrate how to insert a sample user and a widget associated with that user.

-- Example: Insert a sample user
INSERT INTO users (username) VALUES ('testuser');

-- Example: Insert a sample widget for the user with username 'testuser'
INSERT INTO widgets (user_id, prompt, content) VALUES
    ((SELECT id FROM users WHERE username = 'testuser'), 'Summarize the provided data.', '{"chart": "line", "data": [1, 2, 3]}');
