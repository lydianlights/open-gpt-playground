import { useContext, type Component, For } from "solid-js";
import { FaSolidPlus } from "solid-icons/fa";
import { ChatContext, GPTMessageRole } from "@/contexts/ChatContext";
import HorizontalRule from "@/components/HorizontalRule";
import Button from "@/components/Button";
import ChatMessage from "./ChatMessage";

export type ChatSectionProps = {};
const ChatSection: Component<ChatSectionProps> = () => {
    const [state, { messages, submit }] = useContext(ChatContext);

    function handleCreateMessage() {
        let role: GPTMessageRole = "user";
        if (
            state.messages.length &&
            state.messages[state.messages.length - 1].role !== "assistant"
        ) {
            role = "assistant";
        }
        messages.create({
            role: role,
            content: "",
            functionContent: "",
            useFunctionContent: false,
        });
    }

    return (
        <div class="w-full h-full flex flex-col">
            <div class="flex-1 flex flex-col overflow-auto pb-6">
                <For each={state.messages}>
                    {(message) => (
                        <>
                            <ChatMessage message={message} />
                            <HorizontalRule />
                        </>
                    )}
                </For>

                <div class="mt-4 ml-4">
                    <Button
                        onClick={handleCreateMessage}
                        variation="secondary"
                        class="hocus-visible:text-primary"
                    >
                        <FaSolidPlus fill="currentColor" />
                    </Button>
                </div>
            </div>
            <div class="flex-none pt-6">
                <Button onClick={submit} variation="primary">
                    Submit
                </Button>
            </div>
        </div>
    );
};

export default ChatSection;
