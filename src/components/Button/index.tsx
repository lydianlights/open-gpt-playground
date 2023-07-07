import type { Component, JSX } from "solid-js";
import { createMemo, splitProps } from "solid-js";
import { defaultProps } from "@/utils/solid-helpers";

export type ButtonVariations = keyof typeof variations;
const variations = {
    default: "bg-grey-200 hocus-visible:bg-grey-300 text-black",
    primary: "bg-primary hocus-visible:bg-primary-dark text-white",
    secondary: "bg-grey-200 hocus-visible:bg-grey-300 text-black",
    transparent: "bg-transparent text-black",
};

export type ButtonProps = {
    variation?: ButtonVariations;
} & JSX.ButtonHTMLAttributes<HTMLButtonElement>;
const Button: Component<ButtonProps> = (unresolvedProps) => {
    const props = defaultProps(unresolvedProps, {
        variation: "default",
        class: "",
    });
    const [split, rest] = splitProps(props, ["class"]);
    const variation = createMemo(
        () => variations[props.variation] ?? variations["default"]
    );

    return (
        <button
            class={`py-[0.5em] px-4 rounded transition-colors whitespace-nowrap disabled:opacity-70 disabled:pointer-events-none ${variation()} ${
                split.class
            }`}
            {...rest}
        />
    );
};

export default Button;
