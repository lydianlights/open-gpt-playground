import type { Component, JSX } from "solid-js";
import { defaultProps } from "@/utils/solid-helpers";

export type SectionLabelProps = JSX.HTMLAttributes<HTMLDivElement>;
const SectionLabel: Component<SectionLabelProps> = (unresolvedProps) => {
    const props = defaultProps(unresolvedProps, { class: "" });
    return (
        <div
            class={`uppercase font-semibold text-[0.8rem] tracking-wider ${props.class}`}
        >
            {props.children}
        </div>
    );
};

export default SectionLabel;
