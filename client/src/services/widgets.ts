import type { User } from "@/hooks/AuthContext";
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

async function* generateUIForWidget(
  widgetId: Widget["id"],
  prompt: Widget["prompt"]
) {
  const user = localStorage.getItem("currentUser");
  if (!user) {
    throw new Error("User not found in localStorage");
  }
  const parsedUser: User = JSON.parse(user);
  const response = await fetch(
    `${import.meta.env.VITE_THESYS_BACKEND_URL}/ai/generate-ui`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-ID": parsedUser.user_id.toString() || "",
      },
      body: JSON.stringify({
        prompt,
        widgetId: widgetId,
      }),
    }
  );
  if (!response.ok) {
    // log actual error response
    const errorResponse = await response.json();
    throw new Error(errorResponse.error || response.statusText);
  }
  // Set up stream reading utilities
  const decoder = new TextDecoder();
  const stream = response.body?.getReader();

  if (!stream) {
    throw new Error("response.body not found");
  }

  // Read the stream chunk by chunk
  while (true) {
    const { done, value } = await stream.read();
    // Break the loop when stream is complete
    if (done) break;
    // Decode the chunk, considering if it's the final chunk
    const chunk = decoder.decode(value, { stream: !done });
    // Accumulate response and update state
    yield chunk;
  }
};

export default {
  getAllWidgets,
  createWidget,
  deleteWidget,
  generateUIForWidget,
};