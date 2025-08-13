import { Request, Response } from "express";
import { transformStream } from "@crayonai/stream";
import {
  BASE_SYSTEM_PROMPT,
  DATABASE_SYSTEM_PROMPT,
} from "../lib/constants.js";
import { thesysService } from "../services/thesysAIService.js";
import { openaiService } from "../services/openAIService.js";
import * as widgetService from "../services/widgetService.js";
import {
  DataForPrompt,
  Message,
  QueryForPrompt,
  Widget,
} from "../lib/types.js";
import {
  validatePrompt,
  validateGeneratedSQLQuery,
} from "../middleware/aiValidator.js";
import { query } from "../config/db.js";
import logger from "../config/logger.js";

// Helper function to get SQL query for the prompt
const getSQLQueryForPrompt = async (
  prompt: string,
  lastInteraction: {
    error: string | null;
    response: string | null;
  }
): Promise<QueryForPrompt> => {
  const messages: Message[] = [DATABASE_SYSTEM_PROMPT];
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
    logger.error("Error fetching data for prompt:", { error });
    return { success: false, error: "Failed to fetch data for prompt" };
  }
};
// Helper functions to hydrate the prompt with data
const hydratePromptWithGenerativeQueryData = async (
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

  logger.info(`Received prompt ${prompt} for widget ${widgetId} by user ${userId}`);
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
      logger.info(`Attempt No. ${MAX_RETRIES - retryCount + 1}: Generated SQL query: ${sqlQueryForPrompt.data}`);

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
      dataForPrompt = await getDataForPrompt(sqlQueryForPrompt.data || "");
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
          logger.error(`Exceeded max retries for prompt: ${prompt}`, { error: error.message });
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
const hydratePromptWithLastQueryData = async (
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

export const generateResponse = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { prompt, widgetId } = req.body;
    const USER_ID = req.USER_ID;

    if (!USER_ID) {
      res.status(400).json({
        success: false,
        error: "User ID is required",
      });
      return;
    }

    const myWidget = await widgetService.getWidgetById(widgetId, USER_ID);
    if (!myWidget) {
      res.status(404).json({
        success: false,
        error: "Widget not found",
      });
      return;
    }

    let hydratedPromptResponse: DataForPrompt = {
      success: false,
    };
    if (myWidget.sql_query) {
      // sql -> data -> ui
      hydratedPromptResponse = await hydratePromptWithLastQueryData(
        myWidget.sql_query
      );
    } else {
      // prompt -> sql -> data -> ui
      const validationResult = validatePrompt(prompt);
      if (!validationResult.isValid) {
        res.status(400).json({
          success: false,
          error: validationResult.error || "Invalid prompt",
        });
        return;
      }
      hydratedPromptResponse = await hydratePromptWithGenerativeQueryData(
        prompt,
        myWidget.id,
        USER_ID
      );
    }
    if (!hydratedPromptResponse.success) {
      await widgetService.deleteWidget(myWidget.id, USER_ID);
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
      let fullContent = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        fullContent += value;
        res.write(encoder.encode(value));
      }

      // Update the widget with the final content
      if (hydratedPromptResponse.updatedWidget) {
        widgetService.updateWidget(
          hydratedPromptResponse.updatedWidget.id,
          hydratedPromptResponse.updatedWidget.sql_query,
          fullContent,
          USER_ID
        );
      } else if (!myWidget.sql_query) {
        logger.warn(
          "No updated widget found to save the content. This might be an issue."
        );
      }

      res.end();
    };

    await pushStream();
  } catch (error) {
    logger.error(`Error in AI generation: ${error}`);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
    return;
  }
};
