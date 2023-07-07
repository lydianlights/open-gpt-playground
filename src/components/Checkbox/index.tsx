import type { Component } from "solid-js";
import { createMemo, createUniqueId } from "solid-js";
import * as checkbox from "@zag-js/checkbox";
import { normalizeProps, useMachine } from "@zag-js/solid";
import type { MachineContext } from "@zag-js/checkbox/dist/checkbox.types";
import { AiOutlineCheck } from "solid-icons/ai";
import { defaultProps } from "@/utils/solid-helpers";
import css from "./styles.module.css";

export type CheckboxProps = {
    label: string;
    value: boolean;
    onChange: (value: boolean) => void;
    class: string;
};
const Checkbox: Component<CheckboxProps> = (unresolvedProps) => {
    const props = defaultProps(unresolvedProps, {
        class: "",
    });

    const context: Partial<MachineContext> = {
        checked: props.value,
        onChange: (e) => {
            props.onChange(!!e.checked);
        },
    };
    const [state, send] = useMachine(
        checkbox.machine({ id: createUniqueId() }),
        {
            context,
        }
    );
    const api = createMemo(() => checkbox.connect(state, send, normalizeProps));

    return (
        <label
            {...api().rootProps}
            class={`${css["checkbox-root"]} ${props.class} flex items-center cursor-pointer w-fit`}
        >
            <div
                {...api().controlProps}
                class={`${css["checkbox-control"]} flex-none w-6 h-6 rounded flex justify-center items-center transition-colors duration-100`}
            >
                <AiOutlineCheck
                    fill="currentColor"
                    size={20}
                    data-checked={api().isChecked ? "" : undefined}
                    class="flex-none text-white opacity-0 data-[checked]:opacity-100 transition-opacity duration-100"
                />
            </div>
            <div {...api().labelProps} class="flex-1 ml-2">
                {props.label}
            </div>
            <input {...api().inputProps} />
        </label>
    );
};

export default Checkbox;
