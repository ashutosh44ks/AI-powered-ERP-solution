import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import OpenAI from "openai";
import { transformStream } from "@crayonai/stream";
import { BASE_SYSTEM_PROMPT, Message } from "./constants.js";

const app: Application = express();
const port: number = 3001;
app.use(express.json());
app.use(cors());
dotenv.config();

const client = new OpenAI({
  baseURL: process.env.THESYS_BASE_URL,
  apiKey: process.env.THESYS_API_KEY,
});

app.post("/api/thesys-generate", async (req, res) => {
  const { prompt } = req.body;

  const messages: Message[] = [BASE_SYSTEM_PROMPT];
  messages.push({
    // Messages sent by an end user, containing prompts or additional context information.
    role: "user",
    content: prompt,
  });

  // Create a chat completion request with streaming enabled
  const llmStream = await client.chat.completions.create({
    // "c1-nightly" is part of the Thesys ecosystem
    model: "c1-nightly",
    // The response should be streamed back to the client
    stream: true,
    // The messages to be sent to the model
    messages,
  });

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
  async function pushStream() {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(encoder.encode(value));
    }
    res.end();
  }
  pushStream();
});

app.get("/", (req: Request, res: Response) => {
  res.send("Server is running");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
