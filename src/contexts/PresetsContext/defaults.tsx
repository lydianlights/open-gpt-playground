import {
    getDefaultFunction,
    getDefaultMessage,
    getDefaultState,
} from "@/contexts/ChatContext";
import type { ChatPresetRecord } from "./";

export const DEFAULT_PRESETS: ChatPresetRecord = {
    "Default Preset: Empty": getDefaultState(),
    "Default Preset: Example": {
        ...getDefaultState(),
        systemMessage:
            "You are a helpful chat bot with the ability to report the current weather.",
        messages: [
            {
                ...getDefaultMessage(),
                role: "user",
                content: "Hello, how are you?",
            },
            {
                ...getDefaultMessage(),
                role: "assistant",
                content:
                    "Hello! I'm an AI, so I don't have feelings, but I'm ready and equipped to assist you. How can I help you today?",
            },
            {
                ...getDefaultMessage(),
                role: "user",
                content: "What is the weather like in New York?",
                useFunction: true,
                functionName: "get_current_weather",
            },
            {
                ...getDefaultMessage(),
                role: "assistant",
                useFunction: true,
                functionName: "get_current_weather",
                functionParameters: '{"location": "New York"}',
            },
            {
                ...getDefaultMessage(),
                role: "function",
                functionName: "get_current_weather",
                functionParameters: '"Partly cloudy 84°F"',
            },
            {
                ...getDefaultMessage(),
                role: "assistant",
                content:
                    "The current weather in New York is partly cloudy and 84°F.",
            },
        ],
        functions: [
            {
                ...getDefaultFunction(),
                name: "get_current_weather",
                description: "Get the current weather in a given location",
                parameters: `{
  "type": "object",
  "properties": {
    "location": { "type": "string", "description": "The city and state, e.g. San Francisco, CA" },
    "unit": { "type": "string", "enum": ["celsius", "fahrenheit"] }
  },
  "required": ["location"]
}
`,
            },
        ],
    },
};
