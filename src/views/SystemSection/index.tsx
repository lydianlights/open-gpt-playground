import { useContext } from "solid-js";
import type { Component } from "solid-js";
import { ChatContext } from "@/contexts/ChatContext";
import SectionLabel from "@/components/SectionLabel";

export type SystemSectionProps = {};
const SystemSection: Component<SystemSectionProps> = () => {
    const [state, { setSystemMessage }] = useContext(ChatContext);

    return (
        <div class="w-full h-full p-4 flex flex-col rounded border border-grey-300 focus-within:border-primary-light transition-colors">
            <SectionLabel class="mb-2 flex-none">System</SectionLabel>
            <textarea
                value={state.systemMessage}
                onInput={(e) => {
                    setSystemMessage(e.currentTarget.value);
                }}
                placeholder="You are a helpful assistant."
                aria-label="system message input"
                class="w-full flex-1 outline-none bg-transparent appearance-none resize-none overflow-auto"
            />
        </div>
    );
};

export default SystemSection;
