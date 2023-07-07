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
import Input from "@/components/Input";

export type ChatMessageProps = {
    message: GPTMessage;
};
const ChatMessage: Component<ChatMessageProps> = (props) => {
    const [, { messages }] = useContext(ChatContext);

    function getDefaultUseFunction() {
        if (props.message.role === "user" && props.message.functionName) {
            return true;
        }
        if (
            props.message.role === "assistant" &&
            (props.message.functionName || props.message.functionParameters)
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
        messages.setUseFunction(props.message.id, getDefaultUseFunction());
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

    function getFunctionNamePlaceholderText() {
        if (props.message.role === "user") {
            return "function_to_force_call";
        }
        if (props.message.role === "assistant") {
            return "called_function";
        }
        if (props.message.role === "function") {
            return "function_name";
        }
        return "";
    }

    function getFunctionParamtersPlaceholderText() {
        if (props.message.role === "assistant") {
            return "Function arguments in JSON format";
        }
        if (props.message.role === "function") {
            return "Output from the function";
        }
        return "";
    }

    type InputVisibility = {
        content: boolean;
        functionName: boolean;
        functionParameters: boolean;
    };
    const isVisible = createMemo<InputVisibility>(() => {
        const _isVisible: InputVisibility = {
            content: false,
            functionName: false,
            functionParameters: false,
        };
        if (props.message.role === "user") {
            _isVisible.content = true;
            if (props.message.useFunction) {
                _isVisible.functionName = true;
            }
        } else if (props.message.role === "assistant") {
            if (props.message.useFunction) {
                _isVisible.functionName = true;
                _isVisible.functionParameters = true;
            } else {
                _isVisible.content = true;
            }
        } else if (props.message.role === "function") {
            _isVisible.functionName = true;
            _isVisible.functionParameters = true;
        }
        return _isVisible;
    });

    return (
        <div
            class={`${css["root"]} relative w-full flex flex-col gap-2 p-4 hocus-within:bg-grey-100`}
        >
            <div class="flex gap-2 items-center">
                <div class="flex-none w-32">
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
                <div class="flex-none">
                    <Button
                        variation={
                            props.message.useFunction ? "primary" : "secondary"
                        }
                        onClick={() => {
                            messages.setUseFunction(
                                props.message.id,
                                !props.message.useFunction
                            );
                        }}
                        class={`px-[0.5rem] py-[0.2rem] ${
                            props.message.useFunction
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
                <div class="flex-none">
                    <Show keyed when={isVisible().functionName}>
                        <Input
                            placeholder={getFunctionNamePlaceholderText()}
                            value={props.message.functionName}
                            onChange={(e) =>
                                messages.setFunctionName(
                                    props.message.id,
                                    e.currentTarget.value
                                )
                            }
                        />
                    </Show>
                </div>
            </div>
            <div class="flex-1 flex flex-col gap-2 py-2">
                <Show keyed when={isVisible().content}>
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
                <Show keyed when={isVisible().functionParameters}>
                    <CodeInput
                        placeholder={getFunctionParamtersPlaceholderText()}
                        value={props.message.functionParameters}
                        onInput={(value) =>
                            messages.setFunctionParameters(
                                props.message.id,
                                value
                            )
                        }
                        class={`mt-1 flex-1 ${css["code-input"]}`}
                    />
                </Show>
            </div>
            <div class="absolute top-2 right-2">
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
