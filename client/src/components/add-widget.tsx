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
import { Label } from "@/components/ui/label";
import { IconLoader2, IconPlus } from "@tabler/icons-react";
import { Textarea } from "./ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import widgetService from "@/services/widgets";
import type { Widget } from "@/lib/constants";

export function AddWidgetDialog() {
  const closeRef = useRef<HTMLButtonElement>(null);
  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: widgetService.createWidget,
    onSuccess: () => {
      console.log("Widget created successfully");
      queryClient.invalidateQueries({ queryKey: ['widgets'] });
      // Clear the form and close the dialog after submit
      const form = document.getElementById("add-widget-form") as HTMLFormElement;
      form.reset();
      closeRef.current?.click();
    },
    onError: (error) => {
      console.error("Error creating widget:", error);
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const prompt = formData.get("prompt") as Widget["prompt"];
    mutate(prompt);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="md">
          <IconPlus className="size-4" aria-label="Add Card" />
          <span>Add Widget</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit} className="grid gap-4" id="add-widget-form">
          <DialogHeader>
            <DialogTitle>Add Widget</DialogTitle>
            <DialogDescription>
              Fill in the details below to create a new widget.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <Label htmlFor="prompt">Prompt</Label>
            <Textarea
              id="prompt"
              name="prompt"
              required
              className="h-[6.5rem] overflow-y-auto resize-none"
              rows={4}
              maxLength={500}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" ref={closeRef}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">
              {isPending && <IconLoader2 className="animate-spin" />}
              Add
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
