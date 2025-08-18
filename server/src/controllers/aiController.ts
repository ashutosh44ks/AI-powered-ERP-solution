import { Request, Response } from "express";
import { transformStream } from "@crayonai/stream";
import { THESYS_SYSTEM_PROMPT } from "../lib/constants.js";
import thesysService from "../services/thesysAIService.js";
import * as openaiService from "../services/openAIService.js";
import * as widgetService from "../services/widgetService.js";
import { ApiResponse, DataForPrompt, Message } from "../lib/types.js";
import {
  validatePromptForReadOperations,
  validatePromptForUpdateOperations,
} from "../middleware/aiValidator.js";
import logger from "../config/logger.js";

export const generateUI = async (
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
      hydratedPromptResponse =
        await openaiService.hydratePromptWithLastQueryData(myWidget.sql_query);
    } else {
      // prompt -> sql -> data -> ui
      const validationResult = validatePromptForReadOperations(prompt);
      if (!validationResult.isValid) {
        res.status(400).json({
          success: false,
          error: validationResult.error || "Invalid prompt",
        });
        return;
      }
      hydratedPromptResponse =
        await openaiService.hydratePromptWithGenerativeQueryData(
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

    const messages: Message[] = [THESYS_SYSTEM_PROMPT];
    messages.push({
      role: "user",
      content: newPrompt,
    });

    // Create a chat completion request with streaming enabled
    const llmStream = await thesysService.createThesysChatCompletion(messages);

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

export const saveRecords = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { prompt } = req.body;
    const USER_ID = req.USER_ID;

    if (!USER_ID) {
      res.status(400).json({
        success: false,
        error: "User ID is required",
      });
      return;
    }

    const validationResult = validatePromptForUpdateOperations(prompt);
    if (!validationResult.isValid) {
      logger.error(`Invalid prompt: ${validationResult.error}`);
      res.status(400).json({
        success: false,
        error: validationResult.error || "Invalid prompt",
      });
      return;
    }

    const sqlQueryForPrompt =
      await openaiService.getSQLQueryForPromptWithoutRetry(prompt);
    if (!sqlQueryForPrompt.success) {
      logger.error(`Failed to generate SQL query: ${sqlQueryForPrompt.error}`);
      res.status(400).json({
        success: false,
        error: sqlQueryForPrompt.error || "Failed to generate SQL query",
      });
      return;
    }
    logger.info(`Generated SQL query: ${sqlQueryForPrompt.data}`);
    // const sqlQueryForPrompt = {
    //   success: true,
    //   data: "INSERT INTO Students (first_name, last_name, email, date_of_birth, enrollment_date, gpa) VALUES ('Ashutosh', 'Singh', 'ashutosh.singh@oodles.io', '2000-04-04', CURRENT_DATE, 3.0);",
    // };
    const dataForPrompt = await openaiService.executePromptQuery(
      sqlQueryForPrompt.data || ""
    );
    if (!dataForPrompt.success) {
      logger.error(`Failed to fulfill prompt: ${dataForPrompt.error}`);
      res.status(400).json({
        success: false,
        error: dataForPrompt.error || "Failed to fulfill prompt",
      });
      return;
    }
    logger.info(`Successfully fulfilled prompt: ${prompt}`, {
      dataCount: dataForPrompt.data.length,
    });
    const response: ApiResponse<unknown> = {
      success: true,
      data: dataForPrompt.data,
    };
    res.status(200).json(response);
  } catch (error) {
    logger.error(`Error in saveRecords controller: ${error}`);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
    return;
  }
};
