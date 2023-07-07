import type { Component } from "solid-js";
import { onMount, Show, createEffect, createSignal, on } from "solid-js";
import {
    keymap,
    highlightSpecialChars,
    drawSelection,
    dropCursor,
    lineNumbers,
    EditorView,
} from "@codemirror/view";
import { Compartment, EditorState } from "@codemirror/state";
import {
    defaultHighlightStyle,
    syntaxHighlighting,
    indentOnInput,
    bracketMatching,
} from "@codemirror/language";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import {
    autocompletion,
    completionKeymap,
    closeBrackets,
    closeBracketsKeymap,
} from "@codemirror/autocomplete";
import { json } from "@codemirror/lang-json";
import { customized } from "./theme";
import { defaultProps } from "@/utils/solid-helpers";

export type CodeInputProps = {
    label?: string;
    placeholder?: string;
    value?: string;
    onInput?: (value: string) => void;
    onChange?: (value: string) => void;
    disabled?: boolean;
    height?: string;
    class?: string;
};
const CodeInput: Component<CodeInputProps> = (unresolvedProps) => {
    const props = defaultProps(unresolvedProps, {
        label: "",
        placeholder: "",
        disabled: false,
        class: "",
    });
    let rootRef: HTMLDivElement;
    let editor: EditorView;
    const [internalValue, setInternalValue] = createSignal(props.value ?? "");

    const layoutCompartment = new Compartment();
    const disabledCompartment = new Compartment();
    const inputHandlerCompartment = new Compartment();
    const changeHandlerCompartment = new Compartment();

    onMount(() => {
        const state = EditorState.create({
            doc: internalValue(),
            extensions: [
                customized,
                json(),
                lineNumbers(),
                highlightSpecialChars(),
                history(),
                drawSelection(),
                dropCursor(),
                EditorState.allowMultipleSelections.of(true),
                indentOnInput(),
                syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
                bracketMatching(),
                closeBrackets(),
                autocompletion(),
                keymap.of([
                    ...closeBracketsKeymap,
                    ...defaultKeymap,
                    ...historyKeymap,
                    ...completionKeymap,
                ]),
                layoutCompartment.of([]),
                disabledCompartment.of([]),
                inputHandlerCompartment.of([]),
                changeHandlerCompartment.of([]),
            ],
        });

        editor = new EditorView({
            state,
            parent: rootRef,
        });
    });

    // Update editor resize mode
    createEffect(() => {
        let theme = {};
        if (props.height) {
            theme = {
                "&": { height: props.height },
                ".cm-scroller": { overflow: "auto" },
            };
        }

        const layout = EditorView.theme(theme);

        editor.dispatch({
            effects: layoutCompartment.reconfigure(layout),
        });
    });

    // Update disabled state
    createEffect(() => {
        editor.dispatch({
            effects: disabledCompartment.reconfigure([
                EditorState.readOnly.of(props.disabled),
                EditorView.editable.of(!props.disabled),
            ]),
        });
    });

    // Update onInput listener if prop changes
    createEffect(() => {
        const onInput = props.onInput;
        editor.dispatch({
            effects: inputHandlerCompartment.reconfigure(
                EditorView.updateListener.of(({ docChanged, state }) => {
                    if (docChanged && onInput) {
                        const newValue = state.doc.toString();
                        setInternalValue(newValue);
                        onInput(newValue);
                    }
                })
            ),
        });
    });

    // Update onChange listener if prop changes
    createEffect(() => {
        const onChange = props.onChange;
        editor.dispatch({
            effects: changeHandlerCompartment.reconfigure(
                EditorView.updateListener.of(
                    ({ focusChanged, view, state }) => {
                        if (focusChanged && onChange) {
                            const isFocused = view.hasFocus;
                            if (!isFocused) {
                                const newValue = state.doc.toString();
                                onChange(newValue);
                            }
                        }
                    }
                )
            ),
        });
    });

    // Update editor when value prop changes
    createEffect(
        on(
            () => props.value,
            () => {
                if (props.value === internalValue()) return;
                const transaction = editor.state.update({
                    changes: {
                        from: 0,
                        to: editor.state.doc.length,
                        insert: props.value,
                    },
                });
                const update = editor.state.update(transaction);
                editor.update([update]);
            }
        )
    );

    return (
        <div class={`flex flex-col ${props.class}`}>
            <Show when={!!props.label}>
                <label class="text-sm flex-none">{props.label}</label>
            </Show>
            <div
                class="relative flex-none rounded border border-grey-300 focus-within:border-primary-light transition-colors font-mono"
                classList={{ "bg-grey-200 opacity-80": props.disabled }}
            >
                <Show when={!internalValue()}>
                    <div class="absolute left-6 top-[6px] text-grey-400 text-xs z-10 pointer-events-none">
                        {props.placeholder}
                    </div>
                </Show>
                <div ref={rootRef!} />
            </div>
        </div>
    );
};

export default CodeInput;
