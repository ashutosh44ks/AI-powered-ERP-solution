import api from "@/lib/api";

const saveRecord = async (formData: FormData) => {
  const response = await api.post(`/ai/save-record`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export default {
  saveRecord,
};