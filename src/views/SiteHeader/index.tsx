import {
    createMemo,
    createSignal,
    type Component,
    useContext,
    Show,
    createEffect,
} from "solid-js";
import { FaSolidPlus, FaSolidTrash } from "solid-icons/fa";
import {
    apiKey,
    rememberAPIKey,
    setAPIKey,
    setRememberAPIKey,
} from "@/contexts/global";
import { ChatContext } from "@/contexts/ChatContext";
import { PresetsContext } from "@/contexts/PresetsContext";
import ExternalLink from "@/components/ExternalLink";
import Button from "@/components/Button";
import type { ComboboxOption } from "@/components/Combobox";
import Combobox from "@/components/Combobox";
import VerticalRule from "@/components/VerticalRule";
import Dialog from "@/components/Dialog";
import Input from "@/components/Input";
import Checkbox from "@/components/Checkbox";
import { DEFAULT_PRESETS } from "@/contexts/PresetsContext/defaults";
import { createEffectOn } from "@/utils/solid-helpers";

const SiteHeader: Component = () => {
    const [showAPIKeyDialog, setShowAPIKeyDialog] = createSignal(false);
    const [showNewPresetDialog, setShowNewPresetDialog] = createSignal(false);
    const [selectedPreset, setSelectedPreset] = createSignal("");
    const [newPresetName, setNewPresetName] = createSignal("");

    const [presetsState, { createPreset, deletePreset }] =
        useContext(PresetsContext);
    const [chatState, { loadState }] = useContext(ChatContext);

    const presetList = createMemo<ComboboxOption[]>(() => {
        return Object.entries(presetsState.presets).map(([name]) => ({
            value: name,
            label: name,
        }));
    });

    createEffectOn([selectedPreset], () => {
        const presetData = presetsState.presets[selectedPreset()];
        if (presetData) {
            loadState(presetData);
        }
    });

    createEffectOn([showNewPresetDialog], () => {
        if (showNewPresetDialog()) {
            setNewPresetName(selectedPreset());
        }
    });

    const presetWarning = createMemo(() => {
        if (DEFAULT_PRESETS[newPresetName()]) {
            return "Cannot overwrite default presets. Enter a different name.";
        }
        if (presetsState.presets[newPresetName()]) {
            return "A preset with this name already exists and will be overwritten.";
        }
        return "";
    });

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
                    value={selectedPreset()}
                    onChange={setSelectedPreset}
                    placeholder="Select a preset"
                    class="w-72"
                />
                <Dialog
                    title="New Preset"
                    description="Create a new preset"
                    open={showNewPresetDialog()}
                    setOpen={setShowNewPresetDialog}
                    trigger={(triggerProps) => (
                        <Button
                            {...triggerProps}
                            aria-label="create preset"
                            variation="secondary"
                            class="square-button hocus-visible:text-primary"
                        >
                            <FaSolidPlus fill="currentColor" size={14} />
                        </Button>
                    )}
                >
                    <Input
                        label="Preset Name"
                        placeholder="Enter a name for the new preset"
                        value={newPresetName()}
                        onInput={(e) => setNewPresetName(e.currentTarget.value)}
                    />
                    <Show when={presetWarning()}>
                        <p class="text-sm text-danger mt-2">{`*${presetWarning()}`}</p>
                    </Show>
                    <div class="flex justify-end mt-4">
                        <Button
                            variation="primary"
                            onClick={() => {
                                setShowNewPresetDialog(false);
                                createPreset(newPresetName(), chatState);
                                setSelectedPreset(newPresetName());
                            }}
                            disabled={!!DEFAULT_PRESETS[newPresetName()]}
                        >
                            Done
                        </Button>
                    </div>
                </Dialog>
                <Button
                    aria-label="delete preset"
                    variation="secondary"
                    onClick={() => {
                        deletePreset(selectedPreset());
                        setSelectedPreset("");
                    }}
                    disabled={!!DEFAULT_PRESETS[selectedPreset()]}
                    class="square-button hocus-visible:text-danger"
                >
                    <FaSolidTrash fill="currentColor" size={14} />
                </Button>
                <VerticalRule class="mx-4 py-3" />
                <div class="flex flex-initial items-center text-sm">
                    <Dialog
                        title="Edit API Key"
                        description="Set your OpenAI API key"
                        trigger={(triggerProps) => (
                            <Button variation="primary" {...triggerProps}>
                                Edit API Key
                            </Button>
                        )}
                        open={showAPIKeyDialog()}
                        setOpen={setShowAPIKeyDialog}
                    >
                        <p class="border border-grey-200 p-4 text-sm rounded my-8">
                            Your API key will never be sent to any server except
                            OpenAI's. Note that by clicking "Remember My Key"
                            below, your API key will be stored in this browser's
                            Local Storage. ONLY select this option on a private
                            computer. If you select this option, your API key
                            will be stored in an encrypted format, but{" "}
                            <i>this should not be considered secure</i> against
                            anyone with access to this computer.
                        </p>
                        <p class="mb-2 text-sm text-grey-400">
                            Your key should look something like this:
                            sk-xxxxxxxxxxxx.{" "}
                            <ExternalLink
                                href="https://platform.openai.com/account/api-keys"
                                class="text-primary"
                            >
                                Generate a new key
                            </ExternalLink>
                        </p>
                        <input type="password" style="display: none;" />
                        <Input
                            placeholder="Paste your key here"
                            type="password"
                            name="api key"
                            autocomplete="off"
                            value={apiKey()}
                            onChange={(e) => setAPIKey(e.currentTarget.value)}
                        />
                        <Checkbox
                            label="Remember My Key"
                            value={rememberAPIKey()}
                            onChange={setRememberAPIKey}
                            class="mt-4"
                        />
                        <div class="flex justify-end mt-4">
                            <Button
                                variation="primary"
                                onClick={() => setShowAPIKeyDialog(false)}
                            >
                                Done
                            </Button>
                        </div>
                    </Dialog>
                </div>
                {/* Will add these... one day */}
                {/* <div class="flex flex-initial items-center text-sm">
                    <Button variation="secondary">Export Data</Button>
                </div>
                <div class="flex flex-initial items-center text-sm">
                    <Button variation="secondary">Import Data</Button>
                </div> */}
            </div>
        </div>
    );
};

export default SiteHeader;
