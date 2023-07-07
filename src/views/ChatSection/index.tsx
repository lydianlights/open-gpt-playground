import type { Component } from "solid-js";
import { useContext, For, Show, createMemo } from "solid-js";
import { FaSolidPlus } from "solid-icons/fa";
import type { GPTMessageRole } from "@/contexts/ChatContext";
import { ChatContext, getDefaultMessage } from "@/contexts/ChatContext";
import { apiKey } from "@/contexts/global";
import HorizontalRule from "@/components/HorizontalRule";
import Button from "@/components/Button";
import ChatMessage from "./ChatMessage";
import { Transition } from "solid-transition-group";

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
            ...getDefaultMessage(),
            role: role,
        });
    }

    const error = createMemo(() =>
        !apiKey() ? "Please enter your API key." : state.error
    );

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
            <Transition
                enterActiveClass="transition-opacity ease-in-out duration-200"
                exitActiveClass="transition-opacity ease-in-out duration-200"
                enterClass="opacity-0"
                enterToClass="opacity-1"
                exitToClass="opacity-0"
                exitClass="opacity-0"
            >
                <Show when={error()}>
                    <div class="flex-none my-4">
                        <p class="text-danger-light">{error()}</p>
                    </div>
                </Show>
            </Transition>
            <div class="flex-none">
                <Button
                    onClick={submit}
                    variation="primary"
                    disabled={!apiKey()}
                >
                    Submit
                </Button>
            </div>
        </div>
    );
};

export default ChatSection;
