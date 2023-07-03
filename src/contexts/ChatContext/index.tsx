import type { Component, JSX } from "solid-js";
import { createContext } from "solid-js";
import { createStore } from "solid-js/store";
import { nanoid } from "nanoid";

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

export type GPTFunctionCall = {
    name: string;
    arguments: Record<string, string>;
};

export type GPTMessage = {
    id: string;
    role: GPTMessageRole;
    content: string;
    functionContent: string;
    useFunctionContent: boolean;
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
};

export type ChatContextFuncs = {
    setSystemMessage: (value: string) => void;
    messages: {
        setRole: (id: string, value: GPTMessageRole) => void;
        setContent: (id: string, value: string) => void;
        setFunctionContent: (id: string, value: string) => void;
        setUseFunctionContent: (id: string, value: boolean) => void;
        create: (value: Omit<GPTMessage, "id">) => GPTMessage;
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
    submit: () => void;
};

export type ChatContextValue = [
    ChatContextState,
    ChatContextFuncs | Record<string, never>
];

// ====== DEFAULTS ===== //
function getDefaultState(): ChatContextState {
    return {
        systemMessage: "",
        messages: [
            {
                id: "1",
                role: "user",
                content: "lorem ipsum",
                functionContent: "",
                useFunctionContent: false,
            },
            {
                id: "2",
                role: "assistant",
                content: "",
                functionContent: JSON.stringify({
                    name: "get_butts",
                    arguments: { arg1: "beep", arg2: "boop" },
                }),
                useFunctionContent: true,
            },
            {
                id: "3",
                role: "function",
                content: "",
                functionContent: '"butts butts butts"',
                useFunctionContent: false,
            },
            {
                id: "4",
                role: "assistant",
                content: "Here is butts: butts",
                functionContent: "",
                useFunctionContent: false,
            },
            {
                id: "5",
                role: "user",
                content: "Thank you",
                functionContent: "",
                useFunctionContent: false,
            },
        ],
        functions: [],
        modelOptions: {
            model: DEFAULT_MODEL,
            temperature: 1,
            maxTokens: 256,
            topP: 1,
            frequencyPenalty: 0,
            presencePenalty: 0,
        },
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
    const [state, setState] = createStore(getDefaultState());

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
            setFunctionContent: (id, value) => {
                const index = state.messages.findIndex((m) => m.id === id);
                if (index < 0) return;
                setState("messages", index, "functionContent", () => value);
            },
            setUseFunctionContent: (id, value) => {
                const index = state.messages.findIndex((m) => m.id === id);
                if (index < 0) return;
                setState("messages", index, "useFunctionContent", () => value);
            },
            create: (value) => {
                const newMessage = { id: nanoid(10), ...value };
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
                const newFunction = { id: nanoid(10), ...value };
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
    };

    function submit() {
        console.log("BOOP");
    }

    const ctx: ChatContextValue = [state, funcs];
    return (
        <ChatContext.Provider value={ctx}>
            {props.children}
        </ChatContext.Provider>
    );
};
