import type { Accessor, AccessorArray, MergeProps } from "solid-js";
import { createEffect, mergeProps, on } from "solid-js";

export function defaultProps<T, K extends keyof T>(
    props: T,
    defaults: Required<Pick<T, K>>
): MergeProps<[Required<Pick<T, K>>, T]> {
    const resolvedProps = mergeProps(defaults, props);
    return resolvedProps;
}

export function createEffectOn<T>(
    deps: AccessorArray<T> | Accessor<T>,
    fn: (value: T, prev: T | undefined) => void,
    options?: { name?: string }
): void {
    createEffect(on(deps, fn), undefined, options);
}
