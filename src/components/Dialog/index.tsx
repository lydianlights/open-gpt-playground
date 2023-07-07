import type { Component, JSX, JSXElement } from "solid-js";
import {
    Show,
    children,
    createEffect,
    createMemo,
    createSignal,
    createUniqueId,
    on,
} from "solid-js";
import { Portal } from "solid-js/web";
import { Transition } from "solid-transition-group";
import * as dialog from "@zag-js/dialog";
import type { MachineContext } from "@zag-js/dialog/dist/dialog.types";
import { normalizeProps, useMachine } from "@zag-js/solid";
import { VsClose } from "solid-icons/vs";
import Button from "@/components/Button";
import { defaultProps } from "@/utils/solid-helpers";

export type DialogProps = {
    title?: string;
    description?: string;
    trigger?: (
        props: JSX.ButtonHTMLAttributes<HTMLButtonElement>
    ) => JSXElement;
    open?: boolean;
    setOpen?: (value: boolean) => void;
    children?: JSX.Element;
};
const Dialog: Component<DialogProps> = (unresolvedProps) => {
    const props = defaultProps(unresolvedProps, {
        title: "",
        description: "",
    });
    const [uncontrolledOpen, setUncontrolledOpen] = createSignal(false);

    function setOpen(value: boolean) {
        if (props.open !== undefined) {
            props.setOpen?.(value);
        } else {
            setUncontrolledOpen(value);
        }
    }

    createEffect(
        on(
            () => props.open,
            () => {
                if (props.open !== undefined) {
                    setUncontrolledOpen(props.open);
                }
            }
        )
    );

    const isOpen = createMemo<boolean>(() => {
        if (props.open !== undefined) return props.open;
        return uncontrolledOpen();
    });

    const context = createMemo<Partial<MachineContext>>(() => ({
        onClose: () => {
            setOpen(false);
        },
        onOpen: () => {
            setOpen(true);
        },
        open: isOpen(),
    }));
    const [state, send] = useMachine(dialog.machine({ id: createUniqueId() }), {
        context,
    });
    const api = createMemo(() => dialog.connect(state, send, normalizeProps));

    // https://github.com/solidjs-community/solid-transition-group/issues/8
    // Hate this but oh well
    const content = children(() => (
        <Transition
            enterActiveClass="transition-opacity ease-in-out duration-200"
            exitActiveClass="transition-opacity ease-in-out duration-200"
            enterClass="opacity-0"
            enterToClass="opacity-1"
            exitToClass="opacity-0"
            exitClass="opacity-0"
        >
            <Show when={api().isOpen}>
                <div>
                    <div
                        {...api().backdropProps}
                        class="absolute top-0 left-0 bottom-0 right-0 bg-black bg-opacity-50"
                    />
                    <div
                        {...api().containerProps}
                        class="absolute top-0 left-0 bottom-0 right-0 flex justify-center items-center"
                    >
                        <div
                            {...api().contentProps}
                            class="relative flex-0 w-[50rem] max-h-[50%] overflow-auto bg-grey-0 p-8 rounded"
                        >
                            <Button
                                {...api().closeTriggerProps}
                                variation="transparent"
                                class="absolute top-2 right-2 hocus-visible:bg-grey-200 hocus-visible:text-danger"
                            >
                                <VsClose />
                            </Button>
                            <div class="mb-4">
                                <h2
                                    {...api().titleProps}
                                    class="text-xl font-bold"
                                >
                                    {props.title}
                                </h2>
                                <p
                                    {...api().descriptionProps}
                                    class="text-sm text-grey-400"
                                >
                                    {props.description}
                                </p>
                            </div>
                            {props.children}
                        </div>
                    </div>
                </div>
            </Show>
        </Transition>
    ));

    return (
        <>
            {props.trigger?.(api().triggerProps)}
            <Show when={content.toArray().length}>
                <Portal>{content()}</Portal>
            </Show>
        </>
    );
};

export default Dialog;
