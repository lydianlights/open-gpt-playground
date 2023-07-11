import type { Component, JSX } from "solid-js";
import { createContext, onMount } from "solid-js";
import type { SetStoreFunction } from "solid-js/store";
import { createStore } from "solid-js/store";
import debounce from "lodash/debounce";
import cloneDeep from "lodash/cloneDeep";
import type { ChatContextState } from "@/contexts/ChatContext";
import { STORAGE } from "@/constants/local-storage";
import { loadLocalStorage, saveLocalStorage } from "@/utils/local-storage";
import { DEFAULT_PRESETS } from "./defaults";

// ====== CONTEXT TYPES ===== //
export type ChatPresetRecord = Record<string, ChatContextState>;

export type PresetsContextState = {
    presets: ChatPresetRecord;
};

export type PresetsContextFuncs = {
    createPreset: (name: string, data: ChatContextState) => void;
    deletePreset: (name: string) => void;
    loadPresets: (data: ChatPresetRecord) => void;
};

export type PresetsContextValue = [
    PresetsContextState,
    PresetsContextFuncs | Record<string, never>
];

// ====== DEFAULTS ===== //
export function getDefaultState(): PresetsContextState {
    return {
        presets: cloneDeep(DEFAULT_PRESETS),
    };
}

// ====== CONTEXT ===== //
export const PresetsContext = createContext<PresetsContextValue>([
    getDefaultState(),
    {},
]);

// ====== PROVIDER ===== //
export type PresetsProviderProps = { children?: JSX.Element };
export const PresetsProvider: Component<PresetsProviderProps> = (props) => {
    const [state, _setState] = createStore(getDefaultState());

    // Intercept setState so we can save changes to local storage
    const setState: SetStoreFunction<PresetsContextState> = (...args: any) => {
        (_setState as any)(...args);
        trackStateChanges(state);
    };

    const funcs: PresetsContextFuncs = {
        createPreset: (name, data) => {
            if (DEFAULT_PRESETS[name]) return;
            setState("presets", (prev) => {
                const newPresets = { ...prev };
                newPresets[name] = cloneDeep(data);
                return newPresets;
            });
        },
        deletePreset: (name) => {
            if (DEFAULT_PRESETS[name]) return;
            setState("presets", (prev) => {
                const newPresets = { ...prev };
                newPresets[name] = undefined!; // Solid magic... kind of hate it tbh
                return newPresets;
            });
        },
        loadPresets: (data) => {
            setState("presets", { ...data, ...DEFAULT_PRESETS });
        },
    };

    onMount(() => {
        try {
            const str = loadLocalStorage(STORAGE.PRESETS);
            if (!str) return;
            const data = JSON.parse(str);
            if (typeof data !== "object") {
                throw new Error("Tried to load invalid preset data!");
            }
            funcs.loadPresets(data);
        } catch (e) {
            console.error(e);
        }
    });

    const trackStateChanges = debounce((state: PresetsContextState) => {
        try {
            const presets = Object.fromEntries(
                Object.entries(state.presets).filter(
                    ([name]) => !DEFAULT_PRESETS[name]
                )
            );
            const str = JSON.stringify(presets);
            saveLocalStorage(STORAGE.PRESETS, str);
        } catch (e) {
            console.error(e);
        }
    }, 500);

    const ctx: PresetsContextValue = [state, funcs];
    return (
        <PresetsContext.Provider value={ctx}>
            {props.children}
        </PresetsContext.Provider>
    );
};
