import api from "@/lib/api";

const updateDataModel = async (prompt: string) => {
  const response = await api.post(`/ai/save-record`, { prompt });
  return response.data;
};

export default {
  updateDataModel,
};