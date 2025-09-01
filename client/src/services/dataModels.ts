import api from "@/lib/api";
import type { APIResponse, DbSchema } from "@/lib/constants";
import type { ColumnDef } from "@tanstack/react-table";

const saveRecord = async (formData: FormData) => {
  const response = await api.post(`/ai/save-record`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

interface DbSchemaMap {
  [key: string]: DbSchema;
}
const getDBTables = async (): Promise<APIResponse<DbSchemaMap>> => {
  const response = await api.get(`/data-models`);
  return response.data;
};

const getTableConfig = async (
  tableName: string | undefined
): Promise<APIResponse<ColumnDef<unknown>[]>> => {
  if (!tableName) throw new Error("Table name is required");
  const response = await api.get(`/data-models/${tableName}/config`);
  return response.data;
};
const getTableData = async (
  tableName: string | undefined
): Promise<APIResponse<unknown[]>> => {
  if (!tableName) throw new Error("Table name is required");
  const response = await api.get(`/data-models/${tableName}/data`);
  return response.data;
};

export default {
  saveRecord,
  getDBTables,
  getTableConfig,
  getTableData,
};
