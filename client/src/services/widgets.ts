import api from "@/lib/api";
import type { Widget } from "@/lib/constants";

const getAllWidgets = async () => {
  const response = await api.get(`/widgets`);
  return response.data;
};

const createWidget = async (widgetPrompt: Widget["prompt"]) => {
  const response = await api.post(`/widgets`, { prompt: widgetPrompt });
  return response.data;
};

const deleteWidget = async (widgetId: Widget["id"]) => {
  const response = await api.delete(`/widgets/${widgetId}`);
  return response.data;
};

export default {
  getAllWidgets,
  createWidget,
  deleteWidget,
};