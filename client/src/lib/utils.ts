import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { C1Response } from "./constants";
import type { APIResponse } from "@/lib/constants";
import type { ColumnDef } from "@tanstack/react-table";

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

export const scrollToBottom = () => {
  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: "smooth",
  });
};

interface BackendColumnDef {
  header: string;
  accessorKey: string;
  sqlDataType: string;
}
export const formatBackendColumnDefToFrontend = (
  data: APIResponse<ColumnDef<unknown>[]>
): APIResponse<ColumnDef<unknown>[]> => {
  if (!data.success) return data;
  if (!data?.data) return data;
  const backendColumns = data.data as BackendColumnDef[];
  return {
    ...data,
    data: backendColumns.map((col) => ({
      header: col.header,
      accessorKey: col.accessorKey,
      cell: (info) => {
        const value = info.getValue();
        if (col.sqlDataType === "timestamp with time zone" && value) {
          const date = new Date(value as string);
          if (!isNaN(date.getTime())) {
            return date.toLocaleString();
          }
        }
        return value;
      },
    })),
  };
};
