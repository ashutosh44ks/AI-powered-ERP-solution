import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openAIClient = new OpenAI({
  baseURL: process.env.THESYS_BASE_URL,
  apiKey: process.env.THESYS_API_KEY,
});

export function getThesysClient(): OpenAI {
  return openAIClient;
}

export async function createThesysChatCompletion(
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]
) {
  return await openAIClient.chat.completions.create({
    model: "c1-nightly",
    stream: true,
    messages,
  });
}

export default {
  getThesysClient,
  createThesysChatCompletion,
};
