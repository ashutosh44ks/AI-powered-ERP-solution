import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { C1Response } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const c1ResponseToJson = (content: string): C1Response => {
  // 1. get rid of content wrapper
  const jsonString = content.replace(/<content>|<\/content>/g, "");
  // 2. unescape quotes
  const unescapedString = jsonString.replace(/&quot;/g, '"');
  // 3. git rid of newlines and extra spaces
  const cleanedString = unescapedString.replace(/\s+/g, " ").trim();
  // 4. parse the JSON string
  return JSON.parse(cleanedString) as C1Response;
};
export const JsonToC1Response = (data: C1Response): string => {
  if (!data) return "<content></content>";
  // add back unescaped quotes
  const escapedData = JSON.stringify(data).replace(/"/g, "&quot;");
  // wrap it in <content> tags
  const content = `<content>${escapedData}</content>`;
  return content;
};
