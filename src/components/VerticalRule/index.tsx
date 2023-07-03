import type { Component } from "solid-js";
import { defaultProps } from "@/utils/solid-helpers";

export type VerticalRuleProps = {
    class?: string;
};

const VerticalRule: Component<VerticalRuleProps> = (unresolvedProps) => {
    const props = defaultProps(unresolvedProps, {
        class: "",
    });
    return (
        <div
            class={`bg-grey-300 w-px h-full bg-clip-content py-2 ${props.class}`}
        />
    );
};

export default VerticalRule;
