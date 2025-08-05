import { Request, Response } from "express";
import { transformStream } from "@crayonai/stream";
import {
  BASE_SYSTEM_PROMPT,
  DATABASE_SYSTEM_PROMPT,
} from "../lib/constants.js";
import { thesysService } from "../services/thesysAIService.js";
import { openaiService } from "../services/openAIService.js";
import { DataForPrompt, Message, QueryForPrompt } from "../lib/types.js";
import {
  validatePrompt,
  validateGeneratedSQLQuery,
} from "../middleware/aiValidator.js";
import { query } from "../db.js";

// Helper function to get SQL query for the prompt
const getSQLQueryForPrompt = async (
  prompt: string
): Promise<QueryForPrompt> => {
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
// Helper function to fetch data using the generated SQL query
const getDataForPrompt = async (
  sqlQueryForPrompt: string
): Promise<DataForPrompt> => {
  try {
    const result = await query(sqlQueryForPrompt);
    return { success: true, data: result.rows };
  } catch (error) {
    console.error("Error fetching data for prompt:", error);
    return { success: false, error: "Failed to fetch data for prompt" };
  }
};
// Helper function to hydrate the prompt with data
const hydratePromptWithData = async (prompt: string) => {
  const MAX_RETRIES = 3;
  let retryCount = MAX_RETRIES;
  let sqlQueryForPrompt: QueryForPrompt;
  let dataForPrompt: DataForPrompt;

  console.log("User Prompt:", prompt);
  // Retry loop for the entire process
  while (retryCount > 0) {
    try {
      // throw new Error("Simulated error for retry logic"); // Simulate an error for retry logic
      // Step 1: Generate SQL query
      sqlQueryForPrompt = await getSQLQueryForPrompt(prompt);
      if (!sqlQueryForPrompt.success) {
        throw new Error(sqlQueryForPrompt.error);
      }
      console.log("LLM Query:", sqlQueryForPrompt.data);

      // Step 2: Validate SQL query
      const validationResult = validateGeneratedSQLQuery(
        sqlQueryForPrompt.data || ""
      );
      if (!validationResult.isValid) {
        throw new Error(validationResult.error);
      }

      // Step 3: Fetch data from the database
      dataForPrompt = await getDataForPrompt(sqlQueryForPrompt.data || "");
      if (!dataForPrompt.success) {
        throw new Error(dataForPrompt.error);
      }

      console.log("LLM Data:", dataForPrompt.data);
      return { success: true, data: dataForPrompt.data };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Attempt failed:", error.message);
        retryCount--;
        if (retryCount <= 0) {
          return {
            success: false,
            error: "Exceeded max retries: " + error.message,
          };
        }
        console.log(`Retrying... ${retryCount} attempts left.`);
      } else {
        console.error("An unknown error occurred.", error);
        return { success: false, error: "An unknown error occurred." };
      }
    }
  }

  return { success: false, error: "An unexpected error occurred." };
};

export const generateResponse = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { prompt } = req.body;

    const validationResult = validatePrompt(prompt);
    if (!validationResult.isValid) {
      res.status(400).json({
        success: false,
        error: validationResult.error || "Invalid prompt",
      });
      return;
    }

    const hydratedPromptResponse = await hydratePromptWithData(prompt);
    if (!hydratedPromptResponse.success) {
      res.status(400).json({
        success: false,
        error: hydratedPromptResponse.error || "Failed to hydrate prompt",
      });
      return;
    }

    // Combine the original prompt with the data retrieved from the database
    const newPrompt = `${prompt} ${JSON.stringify(
      hydratedPromptResponse.data
    )}`;

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
