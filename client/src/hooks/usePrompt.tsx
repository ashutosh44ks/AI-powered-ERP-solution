import { useEffect, useState } from "react";

interface UsePromptProps {
  prompt: string;
}

const usePrompt = ({ prompt }: UsePromptProps) => {
  const [data, setData] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [refetchCount, setFetchCount] = useState<number>(0);

  // Function to refetch data
  const refetch = () => {
    setFetchCount((prevCount) => prevCount + 1);
  };
  
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_THESYS_BACKEND_URL}/ai/generate`,
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
            console.log({
              success: true,
              data: streamResponse,
              prompt: prompt,
            })
            // navigator.clipboard.writeText(streamResponse);
            break;
          }
        }
      } catch (error) {
        console.error("Error fetching TheSys data:", error);
        console.log(error);
        console.log({
          success: false,
          error: error,
          prompt: prompt,
        });
        setError(error instanceof Error ? error.message : "Unknown error");
        setData("");
      } finally {
        setLoading(false);
      }
    })();
  }, [prompt, refetchCount]);

  return {
    data,
    loading,
    error,
    refetch,
    isRefetching: loading && refetchCount > 0,
  };
};

export default usePrompt;
