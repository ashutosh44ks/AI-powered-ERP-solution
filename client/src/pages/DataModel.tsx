import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import DataModelService from "@/services/dataModels";
import { IconLoader2 } from "@tabler/icons-react";

const DataModel = () => {
  const { mutate, isPending } = useMutation({
    mutationFn: DataModelService.updateDataModel,
    onSuccess: ({ data }: { data: unknown }) => {
      console.log("Operation successful:", data);
      toast.success("Operation completed successfully!");
    },
    onError: (err) => {
      console.error("Operation error:", err.message);
    },
  });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    const inputValue = e.currentTarget.querySelector("input")?.value;
    console.log("Submitting data model query:", inputValue);
    if (!inputValue) {
      toast.error("Please enter a valid query.");
      return;
    }
    mutate(inputValue);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-3xl font-bold mb-4">Interact with Data Models</h1>
      <p className="text-gray-600 mb-6 cursor-pointer">
        Add or Insert records into your data models using plain english you use
        everyday!
      </p>
      <form
        className="flex gap-4 items-center justify-center w-full mt-6"
        onSubmit={handleSubmit}
      >
        <Input
          className="w-full max-w-md"
          placeholder="Type your query here..."
          required
        />
        <Button>
          {isPending ? <IconLoader2 className="animate-spin" /> : "Submit"}
        </Button>
      </form>
    </div>
  );
};

export default DataModel;
