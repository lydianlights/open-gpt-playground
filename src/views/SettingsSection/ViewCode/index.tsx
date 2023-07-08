import type { Component } from "solid-js";
import { Show, createSignal, onMount, useContext } from "solid-js";
import { ChatContext } from "@/contexts/ChatContext";
import { formatChatCompletionRequest } from "@/utils/open-ai";
import CodeInput from "@/components/CodeInput";
import { FiClipboard } from "solid-icons/fi";
import Button from "@/components/Button";

export type ViewCodeProps = {};
const ViewCode: Component<ViewCodeProps> = () => {
    const [state] = useContext(ChatContext);
    const [formattedCode, setFormattedCode] = createSignal("");
    const [copied, setCopied] = createSignal(false);
    let timer: number | null = null;

    onMount(() => {
        const json = formatChatCompletionRequest(state);
        try {
            const str = JSON.stringify(json, null, 2);
            setFormattedCode(str);
        } catch {
            setFormattedCode("");
        }
    });

    function handleCopy() {
        navigator.clipboard.writeText(formattedCode());
        setCopied(true);
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(() => {
            setCopied(false);
        }, 2000);
    }

    return (
        <div class="relative">
            <CodeInput disabled value={formattedCode()} height="30rem" />
            <div class="absolute top-3 right-6">
                <Button
                    onClick={handleCopy}
                    variation="secondary"
                    class="h-[2rem] px-[0.6rem]"
                >
                    <Show when={!copied()} fallback="Copied!">
                        <FiClipboard />
                    </Show>
                </Button>
            </div>
        </div>
    );
};

export default ViewCode;
