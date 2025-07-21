import { useState } from "react";

interface AddCardProps {
  handleAddCardClick: (prompt: string) => void;
}
const AddCard = ({ handleAddCardClick }: AddCardProps) => {
  const [prompt, setPrompt] = useState<string>("");
  return (
    <form
      className="border p-2 rounded"
      onSubmit={(e) => {
        e.preventDefault();
        handleAddCardClick(prompt);
        setPrompt("");
      }}
    >
      <h4 className="text-lg font-medium mb-2">Add Card</h4>
      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="border p-1 rounded mb-2 w-full"
        placeholder="Enter card prompt"
        required
      />
      <button type="submit" className="bg-blue-500 text-white p-2 rounded">
        Add Card
      </button>
    </form>
  );
};

export default AddCard;
