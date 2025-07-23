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
import { IconPlus } from "@tabler/icons-react";
import { Textarea } from "./ui/textarea";

interface AddWidgetDialogProps {
  handleSubmit: (prompt: string) => void;
}
export function AddWidgetDialog({ handleSubmit }: AddWidgetDialogProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="md">
          <IconPlus className="size-4" aria-label="Add Card" />
          <span>Add Widget</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            const prompt = formData.get("prompt") as string;
            handleSubmit(prompt);
            e.currentTarget.reset();
            // Close the dialog after submit
            closeRef.current?.click();
          }}
          className="grid gap-4"
        >
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
            <Button type="submit">Add</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
