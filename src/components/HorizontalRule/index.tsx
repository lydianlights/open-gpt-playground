import type { Component, JSX } from "solid-js";
import { splitProps } from "solid-js";
import { defaultProps } from "@/utils/solid-helpers";

export type HorizontalRuleProps = {} & JSX.HTMLAttributes<HTMLHRElement>;
const HorizontalRule: Component<HorizontalRuleProps> = (unresolvedProps) => {
    const props = defaultProps(unresolvedProps, {
        class: "",
    });
    const [split, rest] = splitProps(props, ["class"]);
    return <hr class={`border-grey-300 ${split.class}`} {...rest} />;
};

export default HorizontalRule;
