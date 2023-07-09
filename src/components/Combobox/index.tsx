import type { Component } from "solid-js";
import { createMemo, createSignal, createUniqueId, For, Show } from "solid-js";
import * as combobox from "@zag-js/combobox";
import { normalizeProps, useMachine } from "@zag-js/solid";
import type { MachineContext } from "@zag-js/combobox/dist/combobox.types";
import { createEffectOn, defaultProps } from "@/utils/solid-helpers";
import { normalizeString } from "@/utils/string-helpers";
import { FiChevronDown } from "solid-icons/fi";
import { VsClose } from "solid-icons/vs";
import css from "./styles.module.css";

export type ComboboxOption = {
    value: string;
    label: string;
};

export type ComboboxProps = {
    label?: string;
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
    options: ComboboxOption[];
    disabled?: boolean;
    preserveOrder?: boolean;
    class?: string;
};
const Combobox: Component<ComboboxProps> = (unresolvedProps) => {
    const props = defaultProps(unresolvedProps, {
        label: "",
        placeholder: "",
        disabled: false,
        preserveOrder: false,
        class: "",
    });
    const [filter, setFilter] = createSignal("");

    const filteredOptions = createMemo<ComboboxOption[]>(() =>
        props.options.filter((option) =>
            normalizeString(option.label).includes(normalizeString(filter()))
        )
    );

    const context = createMemo<Partial<MachineContext>>(() => ({
        onInputChange: (e) => {
            setFilter(e.value);
        },
        disabled: props.disabled,
        placeholder: props.placeholder,
        onSelect: (e) => {
            props.onChange(e.value ?? "");
        },
        onOpen: () => {
            setFilter("");
        },
    }));
    const [state, send] = useMachine(
        combobox.machine({
            id: createUniqueId(),
            openOnClick: true,
        }),
        {
            context,
        }
    );
    const api = createMemo(() => combobox.connect(state, send, normalizeProps));

    createEffectOn([() => props.value], () => {
        api().setValue(props.value);
    });

    createEffectOn([() => api().selectedValue], () => {
        const selectedItem = props.options.find(
            (o) => o.value === api().selectedValue
        );
        api().setInputValue(selectedItem?.label ?? "");
    });

    function handleXClicked() {
        props.onChange("");
    }

    return (
        <div>
            <div
                {...api().rootProps}
                class={`flex flex-col w-52 ${props.class}`}
            >
                <label {...api().labelProps} class="text-sm">
                    {props.label}
                </label>
                <div
                    {...api().controlProps}
                    class="inline-flex justify-between rounded border-grey-300 border focus-within:border-primary-light transition-colors"
                >
                    <input
                        {...api().inputProps}
                        class="appearance-none w-full h-8 bg-transparent outline-none pl-2"
                    />
                    <Show when={!!props.value}>
                        <button
                            onClick={handleXClicked}
                            class="outline-transparent focus-visible:outline-primary"
                        >
                            <VsClose />
                        </button>
                    </Show>
                    <button
                        {...api().triggerProps}
                        class="appearance-none inline-flex justify-center items-center w-auto px-2"
                    >
                        <FiChevronDown />
                    </button>
                </div>
            </div>
            <div {...api().positionerProps} style={{ "z-index": "999" }}>
                <Show when={filteredOptions().length > 0}>
                    <ul
                        {...api().contentProps}
                        data-expanded={api().isOpen}
                        class={`relative -top-1 overflow-y-auto max-h-80 text-black bg-grey-0 rounded border border-grey-300 shadow ${css["animate-dropdown-content"]}`}
                    >
                        <For each={filteredOptions()}>
                            {(item, index) => (
                                <li
                                    {...api().getOptionProps({
                                        index: index(),
                                        value: item.value,
                                        label: item.label,
                                    })}
                                    class="flex items-center justify-between h-8 px-1 select-none data-[highlighted]:bg-primary data-[highlighted]:text-white"
                                >
                                    {item.label}
                                </li>
                            )}
                        </For>
                    </ul>
                </Show>
            </div>
        </div>
    );
};

export default Combobox;
