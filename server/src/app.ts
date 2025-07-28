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
  const completion = await client.chat.completions.create({
    // "c1-nightly" is part of the Thesys ecosystem
    model: "c1-nightly",
    // The response should be streamed back to the client
    stream: false,
    // The messages to be sent to the model
    messages,
  });
  if (completion.choices && completion.choices.length > 0) {
    const assistantMessage = completion.choices[0].message.content;
    res.send(assistantMessage);
  } else {
    res.send("No response choices found.");
  }

  // You can also access usage information
  console.log("\nUsage:", completion.usage);
  console.log("Prompt tokens:", completion.usage?.prompt_tokens);
  console.log("Completion tokens:", completion.usage?.completion_tokens);
  console.log("Total tokens:", completion.usage?.total_tokens);
});

app.get("/", (req: Request, res: Response) => {
  res.send("Server is running");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
