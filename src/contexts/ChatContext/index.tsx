import type { Component, JSX } from "solid-js";
import { createContext, onMount } from "solid-js";
import type { SetStoreFunction } from "solid-js/store";
import { createStore } from "solid-js/store";
import { nanoid } from "nanoid";
import debounce from "lodash/debounce";
import merge from "lodash/merge";
import cloneDeep from "lodash/cloneDeep";
import { formatChatCompletionRequest, parseStreamChunk } from "@/utils/open-ai";
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

export type ChunkDelta = {
    id: string;
    content?: string;
    function_name?: string;
    function_arguments?: string;
    done?: boolean;
};

// ====== CONTEXT TYPES ===== //
export type ChatContextState = {
    systemMessage: string;
    messages: GPTMessage[];
    functions: GPTFunction[];
    modelOptions: GPTModelOptions;
    error: string;
    generating: boolean;
};

export type SerializableChatState = Omit<
    ChatContextState,
    "error" | "generating"
>;

export type ChatContextFuncs = {
    setSystemMessage: (value: string) => void;
    messages: {
        setRole: (id: string, value: GPTMessageRole) => void;
        setContent: (id: string, value: string) => void;
        setFunctionName: (id: string, value: string) => void;
        setFunctionParameters: (id: string, value: string) => void;
        setUseFunction: (id: string, value: boolean) => void;
        create: (value: Partial<GPTMessage>) => GPTMessage;
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
    setGenerating: (value: boolean) => void;
    loadState: (state: Partial<SerializableChatState>) => void;
};

export type ChatContextValue = [
    ChatContextState,
    ChatContextFuncs | Record<string, never>
];

// ====== DEFAULTS ===== //
export function getDefaultMessage(): GPTMessage {
    return {
        id: `userdef-${nanoid(20)}`,
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
        generating: false,
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
        setGenerating: (value) => setState("generating", () => value),
        loadState: (state) => {
            const defaultState = getDefaultState();
            setState(merge(defaultState, cloneDeep(state)));
        },
    };

    async function submit() {
        funcs.setError("");
        funcs.setGenerating(true);
        try {
            // Lol openai's js library doesn't handle streaming I guess I have to do it myself...
            const body = {
                ...formatChatCompletionRequest(state),
                stream: true,
            };
            const response = await fetch(
                "https://api.openai.com/v1/chat/completions",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${apiKey()}`,
                    },
                    body: JSON.stringify(body),
                }
            );
            if (!response.ok) {
                const err = Error(response.statusText) as any;
                err.statusCode = response.status;
                throw err;
            }

            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error("Unknown error");
            }
            const decoder = new TextDecoder("utf-8");

            // eslint-disable-next-line no-constant-condition
            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    break;
                }
                const chunk = decoder.decode(value);
                const deltas = parseStreamChunk(chunk);
                for (const delta of deltas) {
                    applyDelta(delta);
                }
            }
        } catch (e) {
            if (e.statusCode === 400) {
                funcs.setError(
                    "Request failed by OpenAI's validation. Function names must contain only [a-z0-9_-] and at most 64 characters. Function parameters must describe a JSON Schema. See the docs for details."
                );
            } else {
                funcs.setError("An unknown error occurred during generation");
            }
            setState("generating", false);
        }
    }

    function applyDelta(delta: ChunkDelta) {
        const index = state.messages.findIndex((m) => m.id === delta.id);
        if (index < 0) {
            const message: Partial<GPTMessage> = {
                id: delta.id,
                role: "assistant",
                content: delta.content,
                functionName: delta.function_name,
                functionParameters: delta.function_arguments,
                useFunction: !!(
                    delta.function_name || delta.function_arguments
                ),
            };
            funcs.messages.create(message);
        } else {
            if (delta.content) {
                setState(
                    "messages",
                    index,
                    "content",
                    (prev) => prev + delta.content
                );
            }
            if (delta.function_name) {
                setState(
                    "messages",
                    index,
                    "functionName",
                    (prev) => prev + delta.function_name
                );
            }
            if (delta.function_arguments) {
                setState(
                    "messages",
                    index,
                    "functionParameters",
                    (prev) => prev + delta.function_arguments
                );
            }
        }
        if (delta.done) {
            setState("generating", false);
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
            const serializableState: SerializableChatState = {
                modelOptions: state.modelOptions,
                systemMessage: state.systemMessage,
                messages: state.messages,
                functions: state.functions,
            };
            const json: any = {
                schema: SCHEMA,
                version: VERSION,
                ...serializableState,
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
