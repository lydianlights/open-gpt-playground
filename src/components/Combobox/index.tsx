import type { Component } from "solid-js";
import { createMemo, createSignal, Show } from "solid-js";
import { Combobox as KCombobox } from "@kobalte/core";
import { FiChevronDown } from "solid-icons/fi";
import { VsClose } from "solid-icons/vs";
import { normalizeString } from "@/utils/string-helpers";
import { createEffectOn, defaultProps } from "@/utils/solid-helpers";
import css from "./styles.module.css";

export type ComboboxOption = {
    value: string;
    label: string;
};

export type ComboboxProps = {
    value: string;
    onChange: (value: string) => void;
    options: ComboboxOption[];
    label?: string;
    placeholder?: string;
    class?: string;
};

const Combobox: Component<ComboboxProps> = (unresolvedProps) => {
    const props = defaultProps(unresolvedProps, {
        label: "",
        placeholder: "",
        class: "",
    });
    let inputRef: HTMLInputElement;
    const [filterText, setFilterText] = createSignal("");
    const [isOpen, setIsOpen] = createSignal(false);

    const value = createMemo<ComboboxOption>(() => {
        return (
            props.options.find((o) => o.value === props.value) ?? {
                value: "",
                label: "",
            }
        );
    });

    const filteredOptions = createMemo<ComboboxOption[]>(() =>
        props.options.filter((option) =>
            normalizeString(option.label).includes(
                normalizeString(filterText())
            )
        )
    );

    function handleChange(value: ComboboxOption) {
        if (props.value === value.value) return;
        props.onChange(value.value);
    }

    function handleInputChange(value: string) {
        setFilterText(value);
    }

    function handleOpenChange(
        value: boolean,
        triggerMode?: KCombobox.ComboboxTriggerMode
    ) {
        setIsOpen(value);
        if (!value) return;
        if (triggerMode === "manual") {
            setFilterText("");
        } else {
            setFilterText(inputRef.value);
        }
    }

    function handleXClicked() {
        props.onChange("");
    }

    createEffectOn([value], () => {
        inputRef.value = value().label;
    });

    return (
        <KCombobox.Root
            options={filteredOptions()}
            value={value()}
            onChange={handleChange}
            onInputChange={handleInputChange}
            onOpenChange={handleOpenChange}
            open={isOpen()}
            placeholder={props.placeholder}
            optionValue="value"
            optionLabel="label"
            multiple={false}
            itemComponent={(localProps) => (
                <KCombobox.Item
                    item={localProps.item}
                    class="flex items-center justify-between h-8 px-1 outline-none select-none data-[highlighted]:bg-primary data-[highlighted]:text-white"
                >
                    <KCombobox.ItemLabel>
                        {localProps.item.rawValue.label}
                    </KCombobox.ItemLabel>
                </KCombobox.Item>
            )}
            class={`flex flex-col w-52 ${props.class}`}
        >
            <KCombobox.Label class="text-sm">{props.label}</KCombobox.Label>
            <KCombobox.Control class="inline-flex justify-between rounded outline-none border-grey-300 border focus-within:border-primary-light transition-colors">
                <KCombobox.Input
                    ref={inputRef!}
                    class="appearance-none inline-flex w-full h-8 bg-transparent outline-none pl-2"
                    onclick={() => {
                        handleOpenChange(!isOpen(), "manual");
                    }}
                />
                <Show when={!!props.value}>
                    <button onClick={handleXClicked}>
                        <VsClose />
                    </button>
                </Show>
                <KCombobox.Trigger class="appearance-none inline-flex justify-center items-center w-auto outline-none px-2">
                    <KCombobox.Icon>
                        <FiChevronDown />
                    </KCombobox.Icon>
                </KCombobox.Trigger>
            </KCombobox.Control>
            <KCombobox.Portal>
                <KCombobox.Content
                    class={`${css["animate-dropdown-content"]} bg-grey-0 rounded border border-grey-300 shadow`}
                >
                    <KCombobox.Listbox class="outline-none overflow-y-auto max-h-80 text-black" />
                </KCombobox.Content>
            </KCombobox.Portal>
        </KCombobox.Root>
    );
};

export default Combobox;
