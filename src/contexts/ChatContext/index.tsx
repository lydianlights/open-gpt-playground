import type { Component, JSX } from "solid-js";
import { createContext, onMount } from "solid-js";
import type { SetStoreFunction } from "solid-js/store";
import { createStore } from "solid-js/store";
import { nanoid } from "nanoid";
import debounce from "lodash/debounce";
import merge from "lodash/merge";
import type { Optional } from "@/types/helpers";
import { Configuration, OpenAIApi } from "openai";
import { formatChatCompletionRequest } from "@/utils/open-ai";
import { loadSessionStorage, saveSessionStorage } from "@/utils/local-storage";
import { STORAGE } from "@/constants/local-storage";
import { apiKey } from "@/contexts/global";

const SCHEMA = "openGPTPlayground";
const VERSION = "1.0";

// ====== GPT TYPES ===== //
// TODO: Get via API
export const MODELS = {
    "gpt-3.5-turbo": "gpt-3.5-turbo",
    "gpt-3.5-turbo-16k": "gpt-3.5-turbo-16k",
    "gpt-4": "gpt-4",
    "gpt-4-32k": "gpt-4-32k",
};

export const DEFAULT_MODEL: GPTModel = "gpt-3.5-turbo";

export type GPTModel = keyof typeof MODELS;

export const MESSAGE_ROLES = {
    system: "System",
    user: "User",
    assistant: "Assistant",
    function: "Function",
};

export type GPTMessageRole = keyof typeof MESSAGE_ROLES;

export type GPTMessage = {
    id: string;
    role: GPTMessageRole;
    content: string;
    functionName: string;
    functionParameters: string;
    useFunction: boolean;
};

export type GPTFunction = {
    id: string;
    name: string;
    description: string;
    parameters: string;
};

export type GPTModelOptions = {
    model: string;
    temperature: number;
    maxTokens: number;
    topP: number;
    frequencyPenalty: number;
    presencePenalty: number;
};

// ====== CONTEXT TYPES ===== //
export type ChatContextState = {
    systemMessage: string;
    messages: GPTMessage[];
    functions: GPTFunction[];
    modelOptions: GPTModelOptions;
    error: string;
};

export type ChatContextFuncs = {
    setSystemMessage: (value: string) => void;
    messages: {
        setRole: (id: string, value: GPTMessageRole) => void;
        setContent: (id: string, value: string) => void;
        setFunctionName: (id: string, value: string) => void;
        setFunctionParameters: (id: string, value: string) => void;
        setUseFunction: (id: string, value: boolean) => void;
        create: (value: Optional<GPTMessage, "id">) => GPTMessage;
        delete: (id: string) => void;
    };
    functions: {
        setName: (id: string, value: string) => void;
        setDescription: (id: string, value: string) => void;
        setParameters: (id: string, value: string) => void;
        create: (value: Omit<GPTFunction, "id">) => GPTFunction;
        delete: (id: string) => void;
    };
    setModel: (value: string) => void;
    setTemperature: (value: number) => void;
    setMaxTokens: (value: number) => void;
    setTopP: (value: number) => void;
    setFreqencyPenalty: (value: number) => void;
    setPresencePenalty: (value: number) => void;

    submit: () => Promise<void>;
    setError: (value: string) => void;
    loadState: (state: Partial<ChatContextState>) => void;
};

export type ChatContextValue = [
    ChatContextState,
    ChatContextFuncs | Record<string, never>
];

// ====== DEFAULTS ===== //
export function getDefaultMessage(): GPTMessage {
    return {
        id: `usergen-${nanoid(20)}`,
        role: "user",
        content: "",
        functionName: "",
        functionParameters: "",
        useFunction: false,
    };
}

export function getDefaultFunction(): GPTFunction {
    return {
        id: `func-${nanoid(20)}`,
        name: "new_function",
        description: "",
        parameters: `{
  "type": "object",
  "properties": {
    "param1": { "type": "string", "description": "The first parameter" },
    "param2": { "type": "integer", "description": "The second parameter" }
  },
  "required": []
}`,
    };
}

export function getDefaultState(): ChatContextState {
    return {
        systemMessage: "",
        messages: [getDefaultMessage()],
        functions: [],
        modelOptions: {
            model: DEFAULT_MODEL,
            temperature: 1,
            maxTokens: 256,
            topP: 1,
            frequencyPenalty: 0,
            presencePenalty: 0,
        },
        error: "",
    };
}

// ====== CONTEXT ===== //
export const ChatContext = createContext<ChatContextValue>([
    getDefaultState(),
    {},
]);

// ====== PROVIDER ===== //
export type ChatProviderProps = { children?: JSX.Element };
export const ChatProvider: Component<ChatProviderProps> = (props) => {
    const [state, _setState] = createStore(getDefaultState());

    // Intercept setState so we can save changes to local storage
    const setState: SetStoreFunction<ChatContextState> = (...args: any) => {
        (_setState as any)(...args);
        trackStateChanges(state);
    };

    const funcs: ChatContextFuncs = {
        setSystemMessage: (value) => setState("systemMessage", () => value),

        messages: {
            setRole: (id, value) => {
                const index = state.messages.findIndex((m) => m.id === id);
                if (index < 0) return;
                setState("messages", index, "role", () => value);
            },
            setContent: (id, value) => {
                const index = state.messages.findIndex((m) => m.id === id);
                if (index < 0) return;
                setState("messages", index, "content", () => value);
            },
            setFunctionName: (id, value) => {
                const index = state.messages.findIndex((m) => m.id === id);
                if (index < 0) return;
                setState("messages", index, "functionName", () => value);
            },
            setFunctionParameters: (id, value) => {
                const index = state.messages.findIndex((m) => m.id === id);
                if (index < 0) return;
                setState("messages", index, "functionParameters", () => value);
            },
            setUseFunction: (id, value) => {
                const index = state.messages.findIndex((m) => m.id === id);
                if (index < 0) return;
                setState("messages", index, "useFunction", () => value);
            },
            create: (value) => {
                const newMessage = { ...getDefaultMessage(), ...value };
                setState("messages", (prev) => [...prev, newMessage]);
                return newMessage;
            },
            delete: (id) =>
                setState("messages", (prev) =>
                    [...prev].filter((m) => m.id !== id)
                ),
        },

        functions: {
            setName: (id, value) => {
                const index = state.functions.findIndex((f) => f.id === id);
                if (index < 0) return;
                setState("functions", index, "name", () => value);
            },
            setDescription: (id, value) => {
                const index = state.functions.findIndex((f) => f.id === id);
                if (index < 0) return;
                setState("functions", index, "description", () => value);
            },
            setParameters: (id, value) => {
                const index = state.functions.findIndex((f) => f.id === id);
                if (index < 0) return;
                setState("functions", index, "parameters", () => value);
            },
            create: (value) => {
                const newFunction = { ...getDefaultFunction(), ...value };
                setState("functions", (prev) => [...prev, newFunction]);
                return newFunction;
            },
            delete: (id) =>
                setState("functions", (prev) =>
                    [...prev].filter((f) => f.id !== id)
                ),
        },

        setModel: (value) => setState("modelOptions", "model", () => value),
        setTemperature: (value) =>
            setState("modelOptions", "temperature", () => value),
        setMaxTokens: (value) =>
            setState("modelOptions", "maxTokens", () => value),
        setTopP: (value) => setState("modelOptions", "topP", () => value),
        setFreqencyPenalty: (value) =>
            setState("modelOptions", "frequencyPenalty", () => value),
        setPresencePenalty: (value) =>
            setState("modelOptions", "presencePenalty", () => value),

        submit,
        setError: (value) => setState("error", () => value),
        loadState: (state) => {
            const defaultState = getDefaultState();
            setState(merge(defaultState, state));
        },
    };

    async function submit() {
        funcs.setError("");
        try {
            const configuration = new Configuration({
                apiKey: apiKey(),
            });
            const openai = new OpenAIApi(configuration);
            const request = formatChatCompletionRequest(state);
            const response = await openai.createChatCompletion({
                ...request,
            });
            const data = response.data;
            const message = response.data.choices[0].message!;
            funcs.messages.create({
                id: data.id!,
                role: message.role!,
                content: message.content!,
                functionName: "",
                functionParameters: "",
                useFunction: false,
            });
        } catch (e) {
            let msg = "";
            if (
                e.response?.status === 400 &&
                e.response?.data?.error?.message
            ) {
                msg =
                    "Request failed. Make sure all functions' parameters describe a valid JSON Schema.";
            } else {
                msg = e.toString();
            }
            funcs.setError(msg);
        }
    }

    onMount(() => {
        try {
            const str = loadSessionStorage(STORAGE.STATE);
            if (!str) return;
            const json = JSON.parse(str);
            const { schema, version, ...state } = json;
            if (schema !== SCHEMA || !version) {
                throw new Error("Tried to load invalid state data!");
            }
            funcs.loadState(state);
        } catch (e) {
            console.error(e);
        }
    });

    const trackStateChanges = debounce((state: ChatContextState) => {
        try {
            const json: any = {
                schema: SCHEMA,
                version: VERSION,
                ...state,
            };
            const str = JSON.stringify(json);
            saveSessionStorage(STORAGE.STATE, str);
        } catch (e) {
            console.error(e);
        }
    }, 500);

    const ctx: ChatContextValue = [state, funcs];
    return (
        <ChatContext.Provider value={ctx}>
            {props.children}
        </ChatContext.Provider>
    );
};
