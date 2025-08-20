import api from "@/lib/api";

const saveRecord = async (prompt: string) => {
  const response = await api.post(`/ai/save-record`, { prompt });
  return response.data;
};

export default {
  saveRecord,
};