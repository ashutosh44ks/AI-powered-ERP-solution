import { Request, Response } from "express";
import { transformStream } from "@crayonai/stream";
import { BASE_SYSTEM_PROMPT } from "../config/constants.js";
import { openaiService } from "../services/openaiService.js";
import { Message } from "../config/types.js";

export const generateResponse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      res.status(400).json({ 
        success: false, 
        error: "Prompt is required" 
      });
      return;
    }

    const messages: Message[] = [BASE_SYSTEM_PROMPT];
    messages.push({
      role: "user",
      content: prompt,
    });

    // Create a chat completion request with streaming enabled
    const llmStream = await openaiService.createChatCompletion(messages);

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
      error: "Internal server error" 
    });
  }
};
