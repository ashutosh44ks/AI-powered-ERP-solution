import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import DataModelService from "@/services/dataModels";
import InputWithAttachment from "@/components/InputWithAttachment";

const DataModel = () => {
  const { mutate, isPending } = useMutation({
    mutationFn: DataModelService.saveRecord,
    onSuccess: ({ data }: { data: unknown }) => {
      console.log("Operation successful:", data);
      toast.success("Operation completed successfully!");
    },
    onError: (err) => {
      console.error("Operation error:", err.message);
      toast.error("An error occurred while processing your request.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    const formData = new FormData();
    const inputRef = e.currentTarget.querySelector("textarea");
    if (inputRef === null) return;
    formData.append("prompt", inputRef.value);
    const fileRef: HTMLInputElement | null = e.currentTarget.querySelector("input[type='file']");
    if (fileRef !== null) {
      const fileValue = fileRef.files?.[0];
      if (fileValue) {
        formData.append("file", fileValue);
      }
    }
    mutate(formData);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-3xl font-bold mb-4">Interact with Data Models</h1>
      <p className="text-gray-600 text-center mb-6">
        Add or Insert records into your data models using plain english you use
        everyday!
      </p>
      <form
        className="flex gap-4 items-center justify-center w-3/4"
        onSubmit={handleSubmit}
      >
        <InputWithAttachment isLoading={isPending} />
      </form>
    </div>
  );
};

export default DataModel;
