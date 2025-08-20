import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  IconArrowsMaximize,
  IconArrowsMinimize,
  IconDotsVertical,
} from "@tabler/icons-react";
import { Button } from "./ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import widgetService from "@/services/widgets";
import type { Widget } from "@/lib/constants";
import { useState } from "react";
import RemoveWidget from "./remove-widget";
import { AlertDialog } from "./ui/alert-dialog";
import { toast } from "sonner";

interface WidgetControlsProps {
  refetchC1Response: () => void;
  handleExpand: () => void;
  isExpand: boolean;
  widgetId: Widget["id"];
}
const WidgetControls = ({
  refetchC1Response,
  handleExpand,
  isExpand,
  widgetId,
}: WidgetControlsProps) => {
  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: widgetService.deleteWidget,
    onSuccess: () => {
      console.log("Widget deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["widgets"] });
      // Collapse the widget before deletion
      if (isExpand) {
        handleExpand();
      }
    },
    onError: (error) => {
      toast.error(error.message);
      console.error(error.message);
    },
  });
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const handleDelete = () => {
    mutate(widgetId);
  };
  return (
    <AlertDialog open={openDeleteModal} onOpenChange={setOpenDeleteModal}>
      <div className="inline-flex rounded-md shadow-sm" role="group">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="cursor-pointer rounded-l-none"
              size="icon"
            >
              <IconDotsVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Widget Options</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={refetchC1Response}>
              Refresh Content
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setOpenDeleteModal(true)}>
              Remove Widget
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="ghost"
          onClick={handleExpand}
          className="cursor-pointer rounded-r-none"
          size="icon"
        >
          {isExpand ? <IconArrowsMinimize /> : <IconArrowsMaximize />}
        </Button>
      </div>
      <RemoveWidget
        handleCancel={() => setOpenDeleteModal(false)}
        handleDelete={handleDelete}
        isPending={isPending}
      />
    </AlertDialog>
  );
};

export default WidgetControls;
