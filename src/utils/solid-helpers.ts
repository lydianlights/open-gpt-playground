import type { MergeProps } from "solid-js";
import { mergeProps } from "solid-js";

export function defaultProps<T, K extends keyof T>(
    props: T,
    defaults: Required<Pick<T, K>>
): MergeProps<[Required<Pick<T, K>>, T]> {
    const resolvedProps = mergeProps(defaults, props);
    return resolvedProps;
}
