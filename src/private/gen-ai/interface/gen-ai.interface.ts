import {
    CoreAssistantMessage,
    CoreMessage,
    CoreTool,
    CoreToolMessage,
    GenerateTextResult,
    LanguageModel
} from "ai"
import { Result } from "neverthrow"
import { GenAIError } from "../error/gen-ai.error"
import { CallSettings } from "../types/types"

export type GenerateTextResponse =
    | (CoreAssistantMessage | CoreToolMessage)[]
    | { message: string }

export interface IGenerateText<TOOLS extends Record<string, CoreTool>> {
    generateText(
        messages: CoreMessage[],
        options?: CallSettings & {
            model?: LanguageModel
            tools?: TOOLS
        }
    ): Promise<Result<GenerateTextResult<TOOLS>, GenAIError>>
}

export interface IGenAI<TOOLS extends Record<string, CoreTool>>
    extends IGenerateText<TOOLS> {}
