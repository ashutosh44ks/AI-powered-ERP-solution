import express, { Application, Request, Response } from "express";
import cors from "cors";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { transformStream } from "@crayonai/stream";

const app: Application = express();
const port: number = 3001;
const genAI = new GoogleGenerativeAI("AIzaSyAkJnB3yEu6O4_CitgPeLyO5uObroiI54M");
const todayDate = new Date().toISOString().slice(0, 10);

const client = new OpenAI({
  baseURL: "https://api.thesys.dev/v1/embed",
  apiKey: "sk-th-HxKbMIvdHgPdUUk02Ka94WJlTyAikOKVAqrro5o2gQw7iTTnnrHiMBPIjLyaTaL9OiCUrlqGRGu5BFmxzKHjdyDRYvNl2ycqM30W",
});

app.use(express.json());
app.use(cors());

app.post("/api/prepareData", async (req, res) => {
  const { prompt, formattedPropertyList, formattedApiList } = req.body;

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `You are a JSON extraction assistant. Given a user prompt, extract a structured object like this nothing else should be there.
      
            {
              "data": {
              "from": "YYYY-MM-DD",
              "to": "YYYY-MM-DD",
              "property": "<matched property value from list or null>",
              "apiToHit": "<matched api alias from list in an array or null>"
              }
            }
            
            Guidelines:
            - You MUST always return "from" and "to" as valid ISO dates (YYYY-MM-DD)- If no dates are mentioned, infer the relevant time range from context:
              - For phrases like "last week": the most recent full week before today (${todayDate}), from Monday to Sunday. (e.g., if today is Monday July 21, 2025, return July 14–20)
              - For "last month", return the 1st to last day of the previous month.
              - For durations like "past 3 days", return the range from 3 days ago to today (${todayDate}).
              - For phrases like "past three weeks", assume current week and 2 preceding weeks from today (${todayDate}).
              - For phrases like "three consecutive weeks", find the most recent Sunday before today (${todayDate}), then take the 3 full weeks before it (Monday to Sunday).
              - If no clues exist, use today’s date (${todayDate}) (same for from and to)..
            - If explicit dates are mentioned (e.g., "6 to 12 June"), parse and use them directly.
            - If only one date is mentioned, use it for both "from" and "to".
            
            -Use today's year (2025) if no year is provided.
            -If user prompt includes phrases like "last week", use the range from Monday to Sunday of the previous week.
            -If user prompt includes "last month", use the first day to last day of the previous month.
            -Match property names against a provided list of known property aliases.
            -If no match is found, return property as null.
            -Match api names against a provided list of known APiliases description.
            -If no match is found, return api as null.
            -Do not respond with any explanations or commentary. Only return the JSON.
            
            Available Properties:
            ${formattedPropertyList}
            
            Available ApisAlias:
            ${JSON.stringify(formattedApiList)}
            
            Prompt:
            ${prompt}`,
          },
        ],
      },
    ],
  });
  const text = result.response.text();
  const cleanedText = text
    .replace(/json\n?/g, "") // Remove json
    .replace(/\n?/g, "") // Remove closing
    .replace(/^\s*{\s*"text":\s*"/, "") // Remove opening wrapper
    .replace(/"\s*}\s*$/, "") // Remove closing wrapper
    .trim();

  console.log("cleanedText", cleanedText);
  try {
    // const parsed = JSON.parse(text);
    res.status(200).json({ text: cleanedText });
  } catch (error) {
    console.error("Error parsing JSON:", error);
    res.status(500).json({ error: "Failed to parse JSON" });
  }
});

interface NewMessage {
  content: string;
  role: "user" | "assistant" | "system";
}
app.post("/api/ask", async (req, res) => {
  const { prompt, previousC1Response } = req.body;

  const messages: NewMessage[] = [];
  if (previousC1Response) {
    messages.push({ role: "assistant", content: previousC1Response });
  }
  messages.push(
    {
      role: "system",
      content: `You are an assistant that takes raw data, such as CSV, JSON, or other structured data, and converts it into summary and visual charts.

      Guidlines; 
      - You must give a detailed summary initially, then provide a visual chart based on the summary.
      - You must give recommendation in the end that how we can improve this,
      - duration is in seconds so show calculated hourly data in the output.

      Here's a general guide on what chart type to use based on the data and context:
      
      - Radar- When comparing multiple variables across different categories in a circular layout.
      - Bar- When showing comparisons between discrete categories or items.
      - Pie- When illustrating parts of a whole, best with few categories.
      - Area- When displaying trends over time with an emphasis on cumulative values.
      - Radial- When showcasing progress or a single metric in a circular, visually impactful format.`,
    },
    {
      role: "user",
      content: prompt,
    }
  );

  const llmStream = await client.chat.completions.create({
    model: "c1-nightly",
    messages,
    stream: true,
  });

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const transformed = transformStream(llmStream, (chunk) => {
    return chunk.choices[0]?.delta?.content || "";
  });

  const reader = transformed.getReader();
  const encoder = new TextEncoder();

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
  res.send("Hesllo Worlsdddd with TypeScript!");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
