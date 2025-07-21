import { useEffect, useState } from "react";
import type { Card as CardType } from "../utils/constants";
import { C1Component } from "@thesysai/genui-sdk";

const Card = ({ id, prompt }: CardType) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [c1Response, setC1Response] = useState<string>("");
  useEffect(() => {
    // get TheSys data here if needed
    (async () => {
      try {
        setIsLoading(true);
        const response = await fetch("http://localhost:3001/api/ask", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: prompt,
          }),
        });
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        // Set up stream reading utilities
        const decoder = new TextDecoder();
        const stream = response.body?.getReader();

        if (!stream) {
          throw new Error("response.body not found");
        }
        // Initialize accumulator for streamed response
        let streamResponse = "";
        // Read the stream chunk by chunk
        while (true) {
          const { done, value } = await stream.read();
          // Decode the chunk, considering if it's the final chunk
          const chunk = decoder.decode(value, { stream: !done });
          // Accumulate response and update state
          streamResponse += chunk;
          setC1Response(streamResponse);
          // Break the loop when stream is complete
          if (done) break;
        }
      } catch (error) {
        console.error("Error fetching TheSys data:", error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [prompt]);
  return (
    <div className="border p-2 rounded">
      <h4 className="text-lg font-medium mb-2">Card {id}</h4>
      {/* clamp prompt to 1 line */}
      <p className="mb-4 overflow-hidden text-ellipsis whitespace-nowrap max-w-64">{prompt}</p>
      {isLoading && <p>Loading...</p>}
      <C1Component
        c1Response={c1Response}
        isStreaming={isLoading}
        // updateMessage={(message) => actions.setC1Response(message)}
      />
    </div>
  );
};

export default Card;
