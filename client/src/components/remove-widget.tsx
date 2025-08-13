import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { IconRefresh } from "@tabler/icons-react";

interface RemoveWidgetProps {
  handleCancel: () => void;
  handleDelete: () => void;
  isPending?: boolean;
}
const RemoveWidget = ({
  handleCancel,
  handleDelete,
  isPending,
}: RemoveWidgetProps) => {
  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
        <AlertDialogDescription>
          This action cannot be undone. This will permanently delete your widget
          and remove all associated data.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={handleDelete}>
          <IconRefresh className={isPending ? "animate-spin" : "hidden"} />
          Continue
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
};

export default RemoveWidget;
