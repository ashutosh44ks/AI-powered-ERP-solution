import { IconX, IconLoader2, IconPlus, IconSend2 } from "@tabler/icons-react";
import { Textarea } from "./ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { Input } from "./ui/input";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface InputWithAttachmentProps {
  isLoading: boolean;
}

const InputWithAttachment = ({ isLoading }: InputWithAttachmentProps) => {
  const [fileName, setFileName] = useState<string>("");
  const inputFileRef = useRef<HTMLInputElement>(null);
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!extension) return;
    if (["csv", "xlsx", "json"].includes(extension)) {
      // extractData(file, extension);
    } else {
      removeFile();
      console.error("Unsupported file type:", extension);
    }
  };
  const removeFile = () => {
    setFileName("");
    if (!inputFileRef.current) return;
    inputFileRef.current.value = "";
  };
  const addFile = () => {
    if (!inputFileRef.current) return;
    inputFileRef.current.click();
  };

  return (
    <div className="w-full border-input rounded-md border bg-transparent px-3 py-1 text-base shadow-xs dark:bg-input/30">
      <Textarea
        className="w-full border-none focus-visible:border-none focus-visible:ring-0 px-0 py-2 dark:bg-transparent max-h-24 resize-none field-sizing-content min-h-10"
        placeholder="Type your query here..."
        required
      />
      <Input
        type="file"
        className="hidden"
        accept=".csv, .xlsx, .json"
        onChange={handleFileChange}
        ref={inputFileRef}
      />
      <div className="flex justify-between items-center my-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className={cn(
                "rounded-full hover:bg-accent p-2 shrink-0 cursor-pointer",
                fileName ? "bg-muted" : "bg-transparent"
              )}
            >
              {fileName ? (
                <div className="flex gap-1 items-center text-xs">
                  {fileName}
                  <IconX
                    className="cursor-pointer size-4"
                    onClick={removeFile}
                  />
                </div>
              ) : (
                <IconPlus className="size-5" onClick={addFile} />
              )}
            </span>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <span className="text-xs">Add files</span>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="rounded-full hover:bg-accent p-2 shrink-0 cursor-pointer">
              {isLoading ? (
                <IconLoader2 className="animate-spin" />
              ) : (
                <IconSend2 className="size-5" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <button className="text-xs">Submit</button>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};

export default InputWithAttachment;
