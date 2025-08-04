import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

class ThesysAIService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      baseURL: process.env.THESYS_BASE_URL,
      apiKey: process.env.THESYS_API_KEY,
    });
  }

  async createChatCompletion(messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]) {
    return await this.client.chat.completions.create({
      model: "c1-nightly",
      stream: true,
      messages,
    });
  }

  getClient(): OpenAI {
    return this.client;
  }
}

export const thesysService = new ThesysAIService();
