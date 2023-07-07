import type { Component } from "solid-js";
import {
    createSignal,
    createMemo,
    useContext,
    createEffect,
    Show,
} from "solid-js";
import { FaSolidPlus, FaSolidTrash } from "solid-icons/fa";
import Ajv from "ajv";
import SectionLabel from "@/components/SectionLabel";
import Button from "@/components/Button";
import Combobox from "@/components/Combobox";
import type { GPTFunction } from "@/contexts/ChatContext";
import { ChatContext, getDefaultFunction } from "@/contexts/ChatContext";
import Input from "@/components/Input";
import Textarea from "@/components/Textarea";
import CodeInput from "@/components/CodeInput";

const ajv = new Ajv();

export type FunctionSectionProps = {};
const FunctionSection: Component<FunctionSectionProps> = () => {
    const [state, { functions }] = useContext(ChatContext);
    const [selectedFunctionId, setSelectedFunctionId] = createSignal("");
    const [paramsError, setParamsError] = createSignal("");

    const selectedFunction = createMemo<GPTFunction | undefined>(() =>
        state.functions.find((f) => f.id === selectedFunctionId())
    );

    const functionOptions = createMemo(() =>
        state.functions.map((f) => ({
            value: f.id,
            label: f.name,
        }))
    );

    function handleCreateFunction() {
        const newFunction = functions.create(getDefaultFunction());
        setSelectedFunctionId(newFunction.id);
    }

    function handleDeleteFunction() {
        const id = selectedFunctionId();
        if (!id) return;
        functions.delete(id);
        setSelectedFunctionId("");
    }

    createEffect(() => {
        selectedFunctionId();
        setParamsError("");
    });

    function handleParamValidation(value: string) {
        let msg = "";
        try {
            const json = JSON.parse(value);
            ajv.compile(json);
        } catch {
            msg =
                "*Invalid JSON Schema format. Check the API Reference for details.";
        }
        setParamsError(msg);
    }

    return (
        <div class="w-full h-full flex flex-col">
            <SectionLabel class="flex-none mb-2">Functions</SectionLabel>
            <div class=" flex-none flex items-center gap-2">
                <Combobox
                    options={functionOptions()}
                    value={selectedFunctionId()}
                    onChange={setSelectedFunctionId}
                    placeholder="Select a function"
                    class="w-72"
                />
                <Button
                    variation="secondary"
                    class="hocus-visible:text-primary"
                    onClick={handleCreateFunction}
                >
                    <FaSolidPlus fill="currentColor" />
                </Button>
                <Button
                    variation="secondary"
                    class="hocus-visible:text-danger"
                    onClick={handleDeleteFunction}
                >
                    <FaSolidTrash fill="currentColor" />
                </Button>
            </div>
            <Input
                value={selectedFunction()?.name ?? ""}
                onInput={(e) => {
                    const id = selectedFunctionId();
                    if (!id) return;
                    functions.setName(id, e.currentTarget.value);
                }}
                placeholder="Function name"
                label="Name"
                disabled={!selectedFunctionId()}
                class="mt-2 w-72 flex-none"
            />
            <Textarea
                value={selectedFunction()?.description ?? ""}
                onInput={(e) => {
                    const id = selectedFunctionId();
                    if (!id) return;
                    functions.setDescription(id, e.currentTarget.value);
                }}
                placeholder="A short description of the function"
                label="Description"
                disabled={!selectedFunctionId()}
                class="mt-2 w-full flex-none"
                inputClass="resize-none"
            />
            <div class="mt-2 flex-none">
                <Show when={!!paramsError()}>
                    <div class="mt-2 text-danger text-sm">{paramsError()}</div>
                </Show>
                <CodeInput
                    label="Parameters"
                    value={selectedFunction()?.parameters ?? ""}
                    onInput={(value) => {
                        const id = selectedFunctionId();
                        if (!id) return;
                        functions.setParameters(id, value);
                    }}
                    placeholder="Describe function parameters in JSON format"
                    disabled={!selectedFunctionId()}
                    onChange={handleParamValidation}
                    height="15rem"
                    class="w-full"
                />
            </div>
        </div>
    );
};

export default FunctionSection;
