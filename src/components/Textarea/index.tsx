import type { Component, JSX } from "solid-js";
import {
    splitProps,
    createUniqueId,
    createMemo,
    Show,
    createSignal,
    onMount,
} from "solid-js";
import { defaultProps } from "@/utils/solid-helpers";

type TextAreaInputEvent = InputEvent & {
    currentTarget: HTMLTextAreaElement;
    target: HTMLTextAreaElement;
};

export type TextareaProps = {
    label?: string;
    autoGrow?: boolean;
    id?: string;
    class?: string;
    inputClass?: string;
} & JSX.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea: Component<TextareaProps> = (unresolvedProps) => {
    const unsplitProps = defaultProps(unresolvedProps, {
        label: "",
        autoGrow: false,
        class: "",
        inputClass: "",
    });
    const [props, rest] = splitProps(unsplitProps, [
        "label",
        "autoGrow",
        "id",
        "class",
        "inputClass",
        "onInput",
    ]);
    const id = createMemo(() => props.id ?? createUniqueId());
    let inputRef: HTMLTextAreaElement;
    const [scrollHeight, setScrollHeight] = createSignal<number>(0);

    onMount(() => {
        setScrollHeight(inputRef.scrollHeight + 2);
    });

    function handleInput(e: TextAreaInputEvent) {
        setScrollHeight(0);
        setScrollHeight(inputRef.scrollHeight + 2);
        if (props.onInput && typeof props.onInput === "function") {
            props.onInput(e);
        }
    }

    return (
        <div class={`flex flex-col ${props.class}`}>
            <Show when={!!props.label}>
                <label class="text-sm flex-none" for={id()}>
                    {props.label}
                </label>
            </Show>
            <textarea
                id={id()}
                class={`flex-auto py-1 px-2 rounded border border-grey-300 outline-none focus:border-primary-light transition-colors disabled:bg-grey-200 disabled:opacity-80 ${props.inputClass}`}
                style={{
                    height: props.autoGrow ? `${scrollHeight()}px` : undefined,
                    resize: props.autoGrow ? "none" : undefined,
                }}
                onInput={handleInput}
                ref={inputRef!}
                {...rest}
            />
        </div>
    );
};

export default Textarea;
