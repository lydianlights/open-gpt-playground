import {
    Component,
    createEffect,
    createMemo,
    createSignal,
    createUniqueId,
} from "solid-js";
import * as slider from "@zag-js/slider";
import { normalizeProps, useMachine } from "@zag-js/solid";
import { defaultProps } from "@/utils/solid-helpers";
import { MachineContext } from "@zag-js/slider/dist/slider.types";

export type SliderProps = {
    label?: string;
    value?: number;
    onChange?: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    origin?: "start" | "center";
    class?: string;
};
const Slider: Component<SliderProps> = (unresolvedProps) => {
    const props = defaultProps(unresolvedProps, {
        label: "",
        min: 0,
        max: 100,
        step: 1,
        origin: "start",
        class: "",
    });

    let inputRef: HTMLInputElement;
    const [internalValue, setInternalValue] = createSignal(
        props.value ?? props.min
    );

    function updateValue(value: number) {
        let newValue;
        if (Number.isNaN(value)) newValue = props.min;
        else if (value < props.min) newValue = props.min;
        else if (value > props.max) newValue = props.max;
        else newValue = value;
        inputRef.value = String(newValue);
        setInternalValue(newValue);
        props.onChange?.(newValue);
    }

    const stepPrecision = createMemo(() => {
        const [, decimals] = props.step.toExponential().split("e-");
        if (!decimals) return 0;
        return Number(decimals);
    });

    const fixSliderPrecision = createMemo(() => {
        const p = stepPrecision();
        const regex = new RegExp(`0{0,${p}}$`);
        return (n: number) => {
            const str =
                p <= 1 ? n.toString() : n.toFixed(p + 1).replace(regex, "");
            return str;
        };
    });

    const context = createMemo<Partial<MachineContext>>(() => ({
        min: props.min,
        max: props.max,
        step: props.step,
        origin: props.origin,
        value: internalValue(),
        onChange: (e) => {
            const value = fixSliderPrecision()(e.value);
            updateValue(Number(value));
        },
    }));
    const [state, send] = useMachine(
        slider.machine({
            id: createUniqueId(),
        }),
        {
            context,
        }
    );
    const api = createMemo(() => slider.connect(state, send, normalizeProps));

    return (
        <div {...api().rootProps} class={`w-60 ${props.class}`}>
            <div class="flex justify-between">
                <label {...api().labelProps}>{props.label}</label>
                <output {...api().outputProps} class="w-16">
                    <input
                        type="number"
                        ref={inputRef!}
                        value={internalValue()}
                        onChange={(e) => {
                            const val = Number(e.currentTarget.value);
                            updateValue(val);
                        }}
                        step={props.step}
                        class="w-full outline-none bg-transparent border border-transparent rounded hover:border-grey-300 focus:border-primary-light text-right px-1 hide-terrible-firefox-spinners-sorry-moz-i-love-you-but-please-give-me-a-pseudoclass-for-spinners"
                    />
                </output>
            </div>
            <div
                {...api().controlProps}
                class="relative flex mt-2 items-center py-1"
            >
                <div
                    {...api().trackProps}
                    class="h-1 flex-1 bg-grey-300 rounded-full"
                >
                    <div
                        {...api().rangeProps}
                        class="h-full bg-primary rounded-full"
                    />
                </div>
                <div
                    {...api().thumbProps}
                    class="h-4 w-4 rounded-full bg-white shadow-sm outline-none border border-grey-300 focus:border-primary-light transition-colors duration-100"
                >
                    <input {...api().hiddenInputProps} />
                </div>
            </div>
        </div>
    );
};

export default Slider;
