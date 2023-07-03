import type { Component, JSX } from "solid-js";
import { splitProps, createUniqueId, createMemo, Show } from "solid-js";
import { defaultProps } from "@/utils/solid-helpers";

export type InputProps = {
    label?: string;
    id?: string;
    class?: string;
    inputClass?: string;
} & JSX.InputHTMLAttributes<HTMLInputElement>;
const Input: Component<InputProps> = (unresolvedProps) => {
    const props = defaultProps(unresolvedProps, {
        label: "",
        class: "",
        inputClass: "",
    });
    const [split, rest] = splitProps(props, [
        "label",
        "id",
        "class",
        "inputClass",
    ]);
    const id = createMemo(() => split.id ?? createUniqueId());

    return (
        <div class={`flex flex-col ${split.class}`}>
            <Show when={!!split.label}>
                <label class="text-sm flex-none" for={id()}>
                    {split.label}
                </label>
            </Show>
            <input
                id={id()}
                class={`flex-1 py-1 px-2 rounded border border-grey-300 outline-none focus:border-primary-light transition-colors disabled:bg-grey-200 disabled:opacity-80 ${split.inputClass}`}
                {...rest}
            />
        </div>
    );
};

export default Input;
