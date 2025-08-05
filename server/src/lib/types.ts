export interface Message {
  content: string;
  role: "user" | "assistant" | "system" | "developer";
}

export interface User {
  id: number;
  name: string;
  email: string;
  created_at: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface QueryForPrompt {
  success: boolean;
  data?: string;
  error?: string;
}

export interface DataForPrompt {
  success: boolean;
  data?: any;
  error?: string;
}