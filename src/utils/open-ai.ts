import type {
    ChatCompletionFunctions,
    ChatCompletionRequestMessage,
    CreateChatCompletionRequest,
} from "openai";
import type { ChatContextState, ChunkDelta } from "@/contexts/ChatContext";

export function formatChatCompletionRequest(
    state: ChatContextState
): CreateChatCompletionRequest {
    const request: CreateChatCompletionRequest = {
        model: state.modelOptions.model,
        temperature: state.modelOptions.temperature,
        max_tokens: state.modelOptions.maxTokens,
        top_p: state.modelOptions.topP,
        frequency_penalty: state.modelOptions.frequencyPenalty,
        presence_penalty: state.modelOptions.presencePenalty,
        messages: formatMessages(state),
    };
    const functions = formatFunctions(state);
    if (functions.length) {
        request.functions = functions;
    }
    return request;
}

function formatMessages(
    state: ChatContextState
): ChatCompletionRequestMessage[] {
    const messages: ChatCompletionRequestMessage[] = [];

    messages.push({
        role: "system",
        content: state.systemMessage,
    });

    for (const message of state.messages) {
        const apiMessage: ChatCompletionRequestMessage = {
            role: message.role,
        };

        if (message.role === "user") {
            apiMessage.content = message.content;
        } else if (message.role === "assistant") {
            if (message.useFunction) {
                apiMessage.content = "";
                apiMessage.function_call = {
                    name: message.functionName,
                    arguments: message.functionParameters,
                };
            } else {
                apiMessage.content = message.content;
            }
        } else if (message.role === "function") {
            apiMessage.name = message.functionName;
            apiMessage.content = message.functionParameters;
        }

        messages.push(apiMessage);
    }

    return messages;
}

function formatFunctions(state: ChatContextState): ChatCompletionFunctions[] {
    const functions: ChatCompletionFunctions[] = [];

    for (const func of state.functions) {
        let parameters: Record<string, any> = {};
        try {
            parameters = JSON.parse(func.parameters);
        } catch {
            /* empty */
        }
        functions.push({
            name: func.name,
            description: func.description,
            parameters,
        });
    }

    return functions;
}

const streamChunkRegex = /^data: /;
export function parseStreamChunk(chunk: string): ChunkDelta[] {
    const deltas: ChunkDelta[] = [];

    const lines = chunk.split("\n");
    for (const line of lines) {
        if (line === "") continue;
        const str = line.replace(streamChunkRegex, "");
        if (str === "[DONE]") continue;
        try {
            const data = JSON.parse(str);
            const delta: ChunkDelta = {
                id: data.id,
                content: data.choices[0].delta.content ?? undefined,
                function_name:
                    data.choices[0].delta.function_call?.name ?? undefined,
                function_arguments:
                    data.choices[0].delta.function_call?.arguments ?? undefined,
                done: !!data.choices[0].finish_reason ?? undefined,
            };
            deltas.push(delta);
        } catch {
            continue;
        }
    }
    return deltas;
}
