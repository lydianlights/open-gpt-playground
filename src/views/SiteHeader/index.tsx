import { createMemo, createSignal, type Component } from "solid-js";
import { FaSolidPlus, FaSolidTrash } from "solid-icons/fa";
import ExternalLink from "@/components/ExternalLink";
import Button from "@/components/Button";
import type { ComboboxOption } from "@/components/Combobox";
import Combobox from "@/components/Combobox";
import VerticalRule from "@/components/VerticalRule";

const presetList = createMemo<ComboboxOption[]>(() => {
    return [];
});

const SiteHeader: Component = () => {
    const [preset, setPreset] = createSignal<string>("");

    function handleChangePreset(value: string) {
        setPreset(value);
    }

    return (
        <div class="w-full h-14 border-b border-grey-300 flex justify-between px-4 flex-none">
            <div class="flex flex-initial items-center gap-2">
                <ExternalLink
                    class="px-4 h-full flex items-center justify-center text-sm hover:text-primary transition-colors whitespace-nowrap"
                    href="https://platform.openai.com/docs"
                >
                    Documentation
                </ExternalLink>
                <ExternalLink
                    class="px-4 h-full flex items-center justify-center text-sm hover:text-primary transition-colors whitespace-nowrap"
                    href="https://platform.openai.com/docs/api-reference"
                >
                    API Reference
                </ExternalLink>
            </div>
            <div class="flex flex-initial items-center gap-2">
                <Combobox
                    options={presetList()}
                    value={preset()}
                    onChange={handleChangePreset}
                    placeholder="Select a preset"
                    class="w-72"
                />
                <Button
                    variation="secondary"
                    class="hocus-visible:text-primary"
                >
                    <FaSolidPlus fill="currentColor" />
                </Button>
                <Button variation="secondary" class="hocus-visible:text-danger">
                    <FaSolidTrash fill="currentColor" />
                </Button>
                <VerticalRule class="mx-4 py-3" />
                <div class="flex flex-initial items-center text-sm">
                    <Button variation="primary">Edit API Key</Button>
                </div>
                <div class="flex flex-initial items-center text-sm">
                    <Button variation="secondary">Export Data</Button>
                </div>
                <div class="flex flex-initial items-center text-sm">
                    <Button variation="secondary">Import Data</Button>
                </div>
            </div>
        </div>
    );
};

export default SiteHeader;
