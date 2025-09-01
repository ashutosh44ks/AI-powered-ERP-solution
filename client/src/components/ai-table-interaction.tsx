import { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { IconLoader2, IconSparkles } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import dataModelService from "@/services/dataModels";
import { toast } from "sonner";
import InputWithAttachment from "./InputWithAttachment";

interface AITableInteractionModalProps {
  tableName: string;
}

export function AITableInteractionModal({
  tableName,
}: AITableInteractionModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: dataModelService.saveRecord,
    onSuccess: () => {
      console.log("Table interaction handled successfully");
      queryClient.invalidateQueries({ queryKey: ["tableData", tableName] });
      // Clear the form and close the dialog after submit
      const form = document.getElementById(
        "table-interaction-form"
      ) as HTMLFormElement;
      form.reset();
      closeRef.current?.click();
    },
    onError: (err) => {
      toast.error(err.message);
      console.error(err.message);
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const prompt = formData.get("prompt-input-with-attachment") as string;
    if (!prompt) return toast.error("Prompt is required");
    const payloadFormData = new FormData();
    payloadFormData.append("prompt", prompt);
    payloadFormData.append("file", formData.get("file-input-with-attachment") as Blob);
    payloadFormData.append("tableName", tableName);
    mutate(payloadFormData);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="md">
          <IconSparkles className="size-4" aria-label="Interaction Card" />
          <span>AI Interactions</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form
          onSubmit={handleSubmit}
          className="grid gap-4"
          id="table-interaction-form"
        >
          <DialogHeader>
            <DialogTitle>AI Interactions</DialogTitle>
            <DialogDescription>
              Provide a prompt to interact with the data in the {tableName}{" "}
              table.
            </DialogDescription>
          </DialogHeader>
          <InputWithAttachment isLoading={isPending} />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" ref={closeRef}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">
              {isPending ? (
                <IconLoader2 className="animate-spin" />
              ) : (
                <IconSparkles />
              )}
              Interact
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
