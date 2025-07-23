import { useEffect, useState } from "react";

interface UsePromptProps {
  prompt: string;
}

const usePrompt = ({ prompt }: UsePromptProps) => {
  const [data, setData] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_THESYS_BACKEND_URL}/thesys-generate`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              prompt: prompt,
            }),
          }
        );
        if (!response.ok) {
          throw new Error(response.statusText);
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
          setData(streamResponse);
          // Break the loop when stream is complete
          if (done) {
            // copy the response to clipboard for debugging
            // navigator.clipboard.writeText(streamResponse);
            break;
          }
        }
      } catch (error) {
        console.error("Error fetching TheSys data:", error);
        setError(error instanceof Error ? error.message : "Unknown error");
        setData("");
      } finally {
        setLoading(false);
      }
    })();
  }, [prompt]);

  return {
    data,
    loading,
    error,
  };
};

export default usePrompt;
