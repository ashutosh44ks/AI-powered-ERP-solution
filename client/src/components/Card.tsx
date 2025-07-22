import { C1Component } from "@thesysai/genui-sdk";
import usePrompt from "../utils/usePrompt";
import type { Card as CardType } from "../utils/constants";

const Card = ({ id, prompt }: CardType) => {
  const { data: c1Response, loading: c1ResponseLoading, error: c1ResponseError } = usePrompt({ prompt });

  return (
    <div className="border p-2 rounded">
      <h4 className="text-lg font-medium mb-2">Card {id}</h4>
      <p className="mb-4 overflow-hidden text-ellipsis whitespace-nowrap max-w-64">
        {prompt}
      </p>
      {c1ResponseError && <p className="text-red-500">Error: {c1ResponseError}</p>}
      {c1ResponseLoading && <p>Loading...</p>}
      <C1Component
        c1Response={c1Response}
        isStreaming={c1ResponseLoading}
        // updateMessage={(message) => actions.setC1Response(message)}
      />
    </div>
  );
};

export default Card;
