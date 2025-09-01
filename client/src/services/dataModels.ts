import api from "@/lib/api";
import type { APIResponse, DbSchema } from "@/lib/constants";

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

export default {
  saveRecord,
  getDBTables,
};
