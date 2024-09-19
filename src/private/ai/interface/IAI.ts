import { Result } from "neverthrow"
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

export interface IGenerateText<TCompletion = unknown> {
    generateText(
        input: string | TCompletion,
        options?: AICustomOptions
    ): Promise<Result<AIGenericResponse<TCompletion>, AIError>>
}

export interface IGenerateTextWithTools<
    TCompletion = unknown,
    TArgs = unknown
> {
    generateTextWithTools(
        input: string | TCompletion,
        options?: AICustomOptions
    ): Promise<Result<AIGenericResponse<TCompletion, TArgs>, AIError>>
}

export interface IAI<TCompletion = unknown, TArgs = unknown>
    extends IGenerateText<TCompletion>,
        IGenerateTextWithTools<TCompletion, TArgs> {}
