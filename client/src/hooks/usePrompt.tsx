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
        const content = await response.text();
        setData(content);
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
