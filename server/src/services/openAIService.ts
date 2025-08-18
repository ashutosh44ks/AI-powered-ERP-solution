import OpenAI from "openai";
import dotenv from "dotenv";
import {
  DATABASE_READ_SYSTEM_PROMPT,
  DATABASE_UPDATE_SYSTEM_PROMPT,
} from "../lib/constants.js";
import {
  DataForPrompt,
  Message,
  QueryForPrompt,
  Widget,
} from "../lib/types.js";
import { validateGeneratedSQLQuery } from "../middleware/aiValidator.js";
import { query } from "../config/db.js";
import logger from "../config/logger.js";
import * as widgetService from "./widgetService.js";
import { DatabaseError } from "pg";

dotenv.config();

const openaiClient = new OpenAI({
  baseURL: process.env.OPENAI_BASE_URL,
  apiKey: process.env.OPENAI_API_KEY,
});

// Core methods
export async function createChatCompletion(
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]
) {
  return await openaiClient.chat.completions.create({
    // model: "gpt-4o-mini",
    model: "gpt-4.1-nano",
    stream: false,
    messages,
  });
}
export function getOpenAIClient(): OpenAI {
  return openaiClient;
}

// Helper function to get SQL query for the prompt
export const getSQLQueryForPrompt = async (
  prompt: string,
  lastInteraction: {
    error: string | null;
    response: string | null;
  }
): Promise<QueryForPrompt> => {
  const messages: Message[] = [DATABASE_READ_SYSTEM_PROMPT];
  messages.push({
    role: "user",
    content: prompt,
  });

  // If there was a previous error or response, include it in the messages
  if (lastInteraction.response) {
    messages.push({
      role: "assistant",
      content: `Previous response: ${lastInteraction.response}`,
    });
  }
  if (lastInteraction.error) {
    messages.push({
      role: "user",
      content: `The previous response was incorrect. Here is the reason: ${lastInteraction.error}. Please try again with the same prompt.`,
    });
  }
  logger.info(`Messages for LLM: ${messages.length}`);

  // const fakeResponseToSaveTokens = await new Promise((resolve) => {
  //   // fake promise to simulate async behavior
  //   setTimeout(() => {
  //     resolve({
  //       success: true,
  //       data: "SELECT * FROM Students WHERE gpa > 3.0;", // Simulated SQL query
  //     });
  //   }, 1000);
  // });
  // return fakeResponseToSaveTokens as QueryForPrompt;

  // create a client to interact with OpenAI
  const llm = await createChatCompletion(messages);

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
export const getSQLQueryForPromptWithoutRetry = async (
  prompt: string
): Promise<QueryForPrompt> => {
  const messages: Message[] = [DATABASE_UPDATE_SYSTEM_PROMPT];
  messages.push({
    role: "user",
    content: prompt,
  });

  // const fakeResponseToSaveTokens = await new Promise((resolve) => {
  //   // fake promise to simulate async behavior
  //   setTimeout(() => {
  //     resolve({
  //       success: true,
  //       data: "SELECT * FROM Students WHERE gpa > 3.0;", // Simulated SQL query
  //     });
  //   }, 1000);
  // });
  // return fakeResponseToSaveTokens as QueryForPrompt;

  // create a client to interact with OpenAI
  const llm = await createChatCompletion(messages);

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
// Helper function to run query on pg database
export const executePromptQuery = async (
  sqlQueryForPrompt: string
): Promise<DataForPrompt> => {
  try {
    const result = await query(sqlQueryForPrompt);
    return { success: true, data: result.rows };
  } catch (error: unknown) {
    if (error instanceof DatabaseError) {
      logger.error(`Error executing prompt-generated query: ${error.message}`);
      return { success: false, error: error.message };
    } else if (error instanceof Error) {
      logger.error("Error executing prompt-generated query:", { error });
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to execute prompt-generated query" };
  }
};
// Helper functions to hydrate the prompt with data
export const hydratePromptWithGenerativeQueryData = async (
  prompt: string,
  widgetId: Widget["id"],
  userId: string
) => {
  const MAX_RETRIES = 3;
  let retryCount = MAX_RETRIES;
  let sqlQueryForPrompt: QueryForPrompt = {
    success: false,
  };
  let dataForPrompt: DataForPrompt = {
    success: false,
  };
  // Variable to store the last error message
  let lastError: string | null = null;

  logger.info(
    `Received prompt ${prompt} for widget ${widgetId} by user ${userId}`
  );
  // Retry loop for the entire process
  while (retryCount > 0) {
    try {
      // Simulate a retry mechanism ---- (1/2)
      // if (retryCount == 3) {
      //   throw new Error("Simulated error for retry logic"); // Simulate an error for retry logic
      // }
      logger.info(`Attempt No. ${MAX_RETRIES - retryCount + 1}`, {
        prompt,
        error: lastError,
        response: sqlQueryForPrompt?.data || null,
      });

      // Step 1: Generate SQL query
      sqlQueryForPrompt = await getSQLQueryForPrompt(prompt, {
        error: lastError,
        response: sqlQueryForPrompt?.data || null,
      });
      if (!sqlQueryForPrompt.success) {
        throw new Error(sqlQueryForPrompt.error);
      }
      logger.info(
        `Attempt No. ${MAX_RETRIES - retryCount + 1}: Generated SQL query: ${
          sqlQueryForPrompt.data
        }`
      );

      // Step 2: Validate SQL query & update widget
      const validationResult = validateGeneratedSQLQuery(
        sqlQueryForPrompt.data || ""
      );
      if (!validationResult.isValid) {
        throw new Error(validationResult.error);
      }
      const updatedWidget = await widgetService.updateWidget(
        widgetId,
        sqlQueryForPrompt.data || null,
        null,
        userId
      );

      // Step 3: Fetch data from the database
      dataForPrompt = await executePromptQuery(sqlQueryForPrompt.data || "");
      if (!dataForPrompt.success) {
        throw new Error(dataForPrompt.error);
      }

      logger.info(`Fetched ${dataForPrompt.data?.length || 0} rows of data`);
      return { success: true, data: dataForPrompt.data, updatedWidget };
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error("Attempt failed:", { message: error.message });
        // Simulate a retry mechanism ---- (2/2)
        // if (retryCount == 3) {
        //   sqlQueryForPrompt = {
        //     success: true,
        //     data: "SELECT * FROM Estudents WHERE gpa > 3.0;", // Fallback query
        //   };
        // }
        retryCount--;
        lastError = error.message;
        if (retryCount <= 0) {
          logger.error(`Exceeded max retries for prompt: ${prompt}`, {
            error: error.message,
          });
          return {
            success: false,
            error: "Exceeded max retries: " + error.message,
          };
        }
        logger.info(`Retrying... ${retryCount} attempts left.`);
      } else {
        logger.error("An unknown error occurred.", { error });
        return { success: false, error: "An unknown error occurred." };
      }
    }
  }

  return { success: false, error: "An unexpected error occurred." };
};
export const hydratePromptWithLastQueryData = async (
  lastQuery: string | null
): Promise<DataForPrompt> => {
  if (!lastQuery) {
    return { success: false, error: "No previous query to hydrate with." };
  }
  try {
    logger.info(`Using last query to fetch data: ${lastQuery}`);
    const result = await query(lastQuery);
    return { success: true, data: result.rows };
  } catch (error) {
    logger.error("Error fetching data for prompt:", { error });
    return { success: false, error: "Failed to fetch data for prompt" };
  }
};
