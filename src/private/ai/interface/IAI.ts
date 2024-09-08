import { Result } from "pratica"
import { AIError } from "../error/ai.error"

export type AICustomOptions = {
    systemMessage?: string
    temperature?: number
    maxTokens?: number
}

export interface ToolCall<ToolArgs = unknown> {
    function: {
        name: string
        arguments: ToolArgs
    }
}

export type AIGenericResponse<T = unknown, TArgs = unknown> = {
    rawResponse: T
    generatedText?: string
    toolCall?: ToolCall<TArgs>
}

/* export interface IGenerateText<T = unknown, TArgs = unknown> {
    generateText(
        prompt: string,
        options?: AICustomOptions
    ): Promise<Result<AIGenericResponse<T, TArgs>, AIError>>
}

export interface IGenerateTextWithTools<T = unknown, TArgs = unknown> {
    generateTextWithTools(
        prompt: string,
        options?: AICustomOptions
    ): Promise<Result<AIGenericResponse<T, TArgs>, AIError>>
} */

export interface IAI<T, TArgs> {
    generateText(
        prompt: string,
        options?: AICustomOptions
    ): Promise<Result<AIGenericResponse<T, TArgs>, AIError>>

    generateTextWithTools(
        prompt: string,
        options?: AICustomOptions
    ): Promise<Result<AIGenericResponse<T, TArgs>, AIError>>
}
