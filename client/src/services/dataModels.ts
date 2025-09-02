import api from "@/lib/api";
import type { APIResponse, ApiResponsePageable } from "@/lib/constants";
import type { ColumnDef } from "@tanstack/react-table";

const saveRecord = async (formData: FormData) => {
  const response = await api.post(`/ai/save-record`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

const getDBTables = async (): Promise<
  APIResponse<
    {
      label: string;
      value: string;
    }[]
  >
> => {
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
  tableName: string | undefined,
  page?: number
): Promise<ApiResponsePageable<unknown>> => {
  if (!tableName) throw new Error("Table name is required");
  const response = await api.get(`/data-models/${tableName}/data`, {
    params: {
      page: page ?? 0,
    },
  });
  return response.data;
};

export default {
  saveRecord,
  getDBTables,
  getTableConfig,
  getTableData,
};
