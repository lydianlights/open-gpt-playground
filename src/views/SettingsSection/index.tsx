import { useContext, type Component } from "solid-js";
import { ChatContext, MODELS } from "@/contexts/ChatContext";
import Combobox from "@/components/Combobox";
import Slider from "@/components/Slider";
import Button from "@/components/Button";
import Dialog from "@/components/Dialog";
import ViewCode from "./ViewCode";

const modelOptions = Object.entries(MODELS).map(([key, val]) => ({
    value: key,
    label: val,
}));

export type SettingsSectionProps = {};
const SettingsSection: Component<SettingsSectionProps> = () => {
    const [state, setState] = useContext(ChatContext);
    return (
        <div class="w-full h-full flex flex-col">
            <Combobox
                label="Model"
                placeholder="Select a model"
                options={modelOptions}
                value={state.modelOptions.model}
                onChange={(value) => setState.setModel(value)}
                class="w-full"
            />
            <Slider
                label="Temperature"
                min={0}
                max={2}
                step={0.01}
                value={state.modelOptions.temperature}
                onChange={(value) => setState.setTemperature(value)}
                class="mt-4 w-full"
            />
            <Slider
                label="Max Tokens"
                min={1}
                max={8000}
                step={1}
                value={state.modelOptions.maxTokens}
                onChange={(value) => setState.setMaxTokens(value)}
                class="mt-4 w-full"
            />
            <Slider
                label="Top P"
                min={0}
                max={1}
                step={0.01}
                value={state.modelOptions.topP}
                onChange={(value) => setState.setTopP(value)}
                class="mt-4 w-full"
            />
            <Slider
                label="Frequency Penalty"
                min={0}
                max={2}
                step={0.01}
                value={state.modelOptions.frequencyPenalty}
                onChange={(value) => setState.setFreqencyPenalty(value)}
                class="mt-4 w-full"
            />
            <Slider
                label="Presence Penalty"
                min={0}
                max={2}
                step={0.01}
                value={state.modelOptions.presencePenalty}
                onChange={(value) => setState.setPresencePenalty(value)}
                class="mt-4 w-full"
            />
            <Dialog
                title="View Code"
                description="Summary of the request parameters in JSON format"
                trigger={(triggerProps) => (
                    <Button
                        {...triggerProps}
                        variation="secondary"
                        class="mt-6"
                    >
                        View Code
                    </Button>
                )}
            >
                <ViewCode />
            </Dialog>
        </div>
    );
};

export default SettingsSection;
