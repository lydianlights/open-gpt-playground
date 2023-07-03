import { createSignal, type Component, createMemo, useContext } from "solid-js";
import { FaSolidPlus, FaSolidTrash } from "solid-icons/fa";
import SectionLabel from "@/components/SectionLabel";
import Button from "@/components/Button";
import Combobox from "@/components/Combobox";
import { ChatContext, GPTFunction } from "@/contexts/ChatContext";
import Input from "@/components/Input";
import Textarea from "@/components/Textarea";
import CodeInput from "@/components/CodeInput";

export type FunctionSectionProps = {};
const FunctionSection: Component<FunctionSectionProps> = () => {
    const [state, { functions }] = useContext(ChatContext);
    const [selectedFunctionId, setSelectedFunctionId] =
        createSignal<string>("");

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
        const newFunction = functions.create({
            name: "new_function",
            description: "",
            parameters: "",
        });
        setSelectedFunctionId(newFunction.id);
    }

    function handleDeleteFunction() {
        const id = selectedFunctionId();
        if (!id) return;
        functions.delete(id);
        setSelectedFunctionId("");
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
            <CodeInput
                label="Parameters"
                value={selectedFunction()?.parameters ?? ""}
                onChange={(value) => {
                    const id = selectedFunctionId();
                    if (!id) return;
                    functions.setParameters(id, value);
                }}
                placeholder="Describe function parameters in JSON format"
                disabled={!selectedFunctionId()}
                height="15rem"
                class="mt-2 w-full flex-none"
            />
        </div>
    );
};

export default FunctionSection;
