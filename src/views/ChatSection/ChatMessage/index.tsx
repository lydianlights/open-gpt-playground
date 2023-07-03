import type { Component } from "solid-js";
import { Show, createMemo, useContext } from "solid-js";
import { TbMathFunction } from "solid-icons/tb";
import { VsClose } from "solid-icons/vs";
import Button from "@/components/Button";
import SectionLabel from "@/components/SectionLabel";
import Textarea from "@/components/Textarea";
import type { GPTMessage, GPTMessageRole } from "@/contexts/ChatContext";
import { ChatContext, MESSAGE_ROLES } from "@/contexts/ChatContext";
import CodeInput from "@/components/CodeInput";
import css from "./styles.module.css";

export type ChatMessageProps = {
    message: GPTMessage;
};
const ChatMessage: Component<ChatMessageProps> = (props) => {
    const [, { messages }] = useContext(ChatContext);

    function getDefaultUseFunctionContent() {
        if (
            props.message.functionContent &&
            (props.message.role === "assistant" ||
                props.message.role === "user")
        ) {
            return true;
        }
        return false;
    }

    function handleCycleRole() {
        let nextRole: GPTMessageRole = "user";
        if (props.message.role === "user") {
            nextRole = "assistant";
        } else if (props.message.role === "assistant") {
            nextRole = "function";
        } else if (props.message.role === "function") {
            nextRole = "user";
        }
        messages.setRole(props.message.id, nextRole);
        messages.setUseFunctionContent(
            props.message.id,
            getDefaultUseFunctionContent()
        );
    }

    function getContentPlaceholderText() {
        if (props.message.role === "user") {
            return "Enter a message from the user.";
        }
        if (props.message.role === "assistant") {
            return "Enter a message from the assistant.";
        }
        return "";
    }

    function getFunctionPlaceholderText() {
        if (props.message.role === "user") {
            return '{"name": "force_function_call"} OR "none"';
        }
        if (props.message.role === "assistant") {
            return '{"name": "called_function", "arguments": { ... }}';
        }
        if (props.message.role === "function") {
            return "Enter a response from the function requested by the agent";
        }
        return "";
    }

    const inputsToShow = createMemo<"both" | "content" | "function">(() => {
        if (props.message.role === "user") {
            if (props.message.useFunctionContent) {
                return "both";
            }
            return "content";
        } else if (props.message.role === "function") {
            return "function";
        }
        if (props.message.useFunctionContent) {
            return "function";
        }
        return "content";
    });

    return (
        <div
            class={`${css["root"]} w-full flex gap-2 px-4 py-6 hocus-within:bg-grey-100`}
        >
            <div class="w-8 flex-none">
                <Button
                    variation={
                        props.message.useFunctionContent
                            ? "primary"
                            : "secondary"
                    }
                    onClick={() => {
                        messages.setUseFunctionContent(
                            props.message.id,
                            !props.message.useFunctionContent
                        );
                    }}
                    class={`px-[0.5rem] py-[0.2rem] ${
                        props.message.useFunctionContent
                            ? "opacity-100"
                            : "opacity-50"
                    } ${
                        props.message.role === "function"
                            ? "invisible"
                            : "visible"
                    }`}
                >
                    <TbMathFunction size={16} />
                </Button>
            </div>
            <div class="w-32 flex-none">
                <Button
                    variation="transparent"
                    class={css["role-button"]}
                    onClick={handleCycleRole}
                >
                    <SectionLabel>
                        {MESSAGE_ROLES[props.message.role]}
                    </SectionLabel>
                </Button>
            </div>
            <div class="flex-1 flex flex-col gap-4">
                <Show
                    when={
                        inputsToShow() === "both" ||
                        inputsToShow() === "content"
                    }
                >
                    <Textarea
                        placeholder={getContentPlaceholderText()}
                        autoGrow
                        value={props.message.content}
                        onChange={(e) =>
                            messages.setContent(
                                props.message.id,
                                e.currentTarget.value
                            )
                        }
                        class={`${css["textarea"]}`}
                        inputClass="py-1"
                    />
                </Show>
                <Show
                    when={
                        inputsToShow() === "both" ||
                        inputsToShow() === "function"
                    }
                    keyed
                >
                    <CodeInput
                        placeholder={getFunctionPlaceholderText()}
                        value={props.message.functionContent}
                        onChange={(value) =>
                            messages.setFunctionContent(props.message.id, value)
                        }
                        class={`relative top-1 ${css["code-input"]}`}
                    />
                </Show>
            </div>
            <div class="flex-none">
                <Button
                    onClick={() => messages.delete(props.message.id)}
                    variation="transparent"
                    class={`${css["delete-button"]} hocus-visible:bg-grey-200 hocus-visible:text-danger px-[0.5rem] py-[0.2rem]`}
                >
                    <VsClose />
                </Button>
            </div>
        </div>
    );
};

export default ChatMessage;
