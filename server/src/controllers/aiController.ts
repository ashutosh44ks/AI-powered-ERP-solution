import { Request, Response } from "express";
import { transformStream } from "@crayonai/stream";
import {
  BASE_SYSTEM_PROMPT,
  DATABASE_SYSTEM_PROMPT,
} from "../lib/constants.js";
import { thesysService } from "../services/thesysAIService.js";
import { openaiService } from "../services/openAIService.js";
import { Message } from "../lib/types.js";
import { validatePrompt, validateGeneratedSQLQuery } from "../middleware/aiValidator.js";
import { query } from "../db.js";

interface QueryForPrompt {
  success: boolean;
  data?: string;
  error?: string;
}
const getSQLQueryForPrompt = async (prompt: string): Promise<QueryForPrompt> => {
  const messages: Message[] = [DATABASE_SYSTEM_PROMPT];
  messages.push({
    role: "user",
    content: prompt,
  });

  // create a client to interact with OpenAI
  const llm = await openaiService.createChatCompletion(messages);

  // If the response contains choices, extract the content
  if (llm.choices && llm.choices.length > 0) {
    const content = llm.choices[0].message?.content;
    if (content) {
      // data: content.split("\n").map((line) => line.trim()).filter(Boolean),
      return {
        success: true,
        data: content,
      };
    }
  }

  // If no content is returned, return an error
  return {
    success: false,
    error: "Failed to generate query from prompt",
  };
};

interface DataForPrompt {
  success: boolean;
  data?: any;
  error?: string;
}
const getDataForPrompt = async (sqlQueryForPrompt: string): Promise<DataForPrompt> => {
  try {
    const result = await query(sqlQueryForPrompt);
    return { success: true, data: result.rows };
  } catch (error) {
    console.error("Error fetching data for prompt:", error);
    return { success: false, error: "Failed to fetch data for prompt" };
  }
};

export const generateResponse = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { prompt } = req.body;

    const { isValid, error } = validatePrompt(prompt);
    if (!isValid) {
      res.status(400).json({
        success: false,
        error: error || "Invalid prompt",
      });
      return;
    }
    console.log("User Prompt:", prompt);

    const sqlQueryForPrompt = await getSQLQueryForPrompt(prompt);
    if (!sqlQueryForPrompt.success) {
      res.status(400).json({
        success: false,
        error: sqlQueryForPrompt.error || "Failed to generate query from prompt",
      });
      return;
    }
    console.log("LLM Query:", sqlQueryForPrompt.data);
    const tempValidate = validateGeneratedSQLQuery(sqlQueryForPrompt.data || "");
    if (!tempValidate.isValid) {
      res.status(400).json({
        success: false,
        error: tempValidate.error || "Invalid SQL query generated",
      });
      return;
    }

    const dataForPrompt = await getDataForPrompt(sqlQueryForPrompt.data || "");
    if (!dataForPrompt.success) {
      res.status(400).json({
        success: false,
        error: dataForPrompt.error || "Failed to fetch data for prompt",
      });
      return;
    }
    console.log("LLM Data:", dataForPrompt.data);

    // Combine the original prompt with the data retrieved from the database
    const newPrompt = `${prompt} ${JSON.stringify(dataForPrompt.data)}`;

    const messages: Message[] = [BASE_SYSTEM_PROMPT];
    messages.push({
      role: "user",
      content: newPrompt,
    });

    // Create a chat completion request with streaming enabled
    const llmStream = await thesysService.createChatCompletion(messages);

    // Serve the response as a Server-Sent Event (SSE)
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Transform the stream to extract the content from the response
    const transformed = transformStream(llmStream, (chunk) => {
      return chunk.choices[0]?.delta?.content || "";
    });
    const reader = transformed.getReader();
    const encoder = new TextEncoder();

    // Function to push data to the response stream
    const pushStream = async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(encoder.encode(value));
      }
      res.end();
    };

    await pushStream();
  } catch (error) {
    console.error("Error in AI generation:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
    return;
  }
};
