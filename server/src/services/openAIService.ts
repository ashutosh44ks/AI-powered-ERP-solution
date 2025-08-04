import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

class OpenAIService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      baseURL: process.env.OPENAI_BASE_URL,
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async createChatCompletion(messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]) {
    return await this.client.chat.completions.create({
      // model: "gpt-4o-mini",
      model: "gpt-4.1-nano",
      stream: false,
      messages,
    });
  }

  getClient(): OpenAI {
    return this.client;
  }
}

export const openaiService = new OpenAIService();
