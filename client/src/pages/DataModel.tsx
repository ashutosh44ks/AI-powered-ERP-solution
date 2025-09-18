import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import DataModelService from "@/services/dataModels";
import InputWithAttachment from "@/components/InputWithAttachment";
import type { Message } from "@thesysai/genui-sdk";
import { Button } from "@/components/ui/button";
import { scrollToBottom } from "@/lib/utils";
import { useDataModelConversation } from "@/hooks/useDataModelConversation";
import { useRef } from "react";
import { IconArrowLeft } from "@tabler/icons-react";
import ChatItem from "@/components/ChatItem";

const DataModel = () => {
  const { messages, updateMessagesStack, clearMessages } =
    useDataModelConversation();
  const formRef = useRef<HTMLFormElement>(null);
  const { mutate, isPending } = useMutation({
    mutationFn: DataModelService.saveRecordRecursively,
    onSuccess: ({ data }: { data: Message[] }) => {
      console.log("Operation successful:", data);
      formRef.current?.reset();
      updateMessagesStack(data);
      setTimeout(scrollToBottom, 500);
    },
    onError: (err) => {
      console.error("Operation error:", err.message);
      toast.error("An error occurred while processing your request.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    // const formData = new FormData();
    const inputRef = e.currentTarget.querySelector("textarea");
    if (inputRef === null) return;
    // formData.append("prompt", inputRef.value);
    // formData.append("history", JSON.stringify(messageHistory));
    // const fileRef: HTMLInputElement | null =
    //   e.currentTarget.querySelector("input[type='file']");
    // if (fileRef !== null) {
    //   const fileValue = fileRef.files?.[0];
    //   if (fileValue) {
    //     formData.append("file", fileValue);
    //   }
    // }
    // mutate(formData);
    mutate({ prompt: inputRef.value, history: messages });
  };

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-3xl font-bold mb-4">Interact with Data Models</h1>
        <p className="text-gray-600 text-center mb-6">
          Add or Insert records into your data models using plain english you
          use everyday!
        </p>
        <form
          className="flex gap-4 items-center justify-center w-3/4"
          onSubmit={handleSubmit}
        >
          <InputWithAttachment
            includeSubmitButton
            loading={isPending}
            includeFileInput={false}
          />
        </form>
      </div>
    );
  }
  return (
    <>
      <div className="absolute">
        <Button variant="default" className="mb-4" onClick={clearMessages}>
          <IconArrowLeft /> New Chat
        </Button>
      </div>
      <div className="flex flex-col items-between justify-center h-full gap-4">
        <div className="flex-1 space-y-2 w-full">
          {messages.map((msg, index) => (
            <ChatItem key={index} msg={msg} />
          ))}
        </div>
        <form
          className="flex gap-4 items-center justify-center w-full"
          onSubmit={handleSubmit}
          ref={formRef}
        >
          <InputWithAttachment
            includeSubmitButton
            loading={isPending}
            includeFileInput={false}
          />
        </form>
      </div>
    </>
  );
};

export default DataModel;
