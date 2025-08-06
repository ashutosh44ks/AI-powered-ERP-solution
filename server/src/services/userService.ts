import { query } from '../db.js';
import { User } from '../lib/types.js';

export const getAllUsers = async (): Promise<User[]> => {
  try {
    const result = await query<User>("SELECT * FROM users");
    return result.rows;
  } catch (error) {
    throw new Error(`Failed to fetch users: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const getUserById = async (id: number): Promise<User | null> => {
  try {
    const result = await query<User>("SELECT * FROM users WHERE id = $1", [id]);
    return result.rows[0] || null;
  } catch (error) {
    throw new Error(`Failed to fetch user: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const result = await query<User>("SELECT * FROM users WHERE email = $1", [email]);
    return result.rows[0] || null;
  } catch (error) {
    throw new Error(`Failed to fetch user by email: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const createUser = async (name: string, email: string): Promise<User> => {
  try {
    const result = await query<User>(
      "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *",
      [name, email]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error(`Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const updateUser = async (id: number, name?: string, email?: string): Promise<User | null> => {
  try {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(name);
    }
    if (email !== undefined) {
      updates.push(`email = $${paramIndex++}`);
      values.push(email);
    }

    if (updates.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);
    const result = await query<User>(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  } catch (error) {
    throw new Error(`Failed to update user: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const deleteUser = async (id: number): Promise<boolean> => {
  try {
    const result = await query("DELETE FROM users WHERE id = $1", [id]);
    return result.rowCount !== null && result.rowCount > 0;
  } catch (error) {
    throw new Error(`Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// For backward compatibility, also export as a class
export class UserService {
  async getAllUsers(): Promise<User[]> {
    return getAllUsers();
  }

  async getUserById(id: number): Promise<User | null> {
    return getUserById(id);
  }

  async createUser(name: string, email: string): Promise<User> {
    return createUser(name, email);
  }

  async updateUser(id: number, name?: string, email?: string): Promise<User | null> {
    return updateUser(id, name, email);
  }

  async deleteUser(id: number): Promise<boolean> {
    return deleteUser(id);
  }
}
