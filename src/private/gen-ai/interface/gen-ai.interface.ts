import { CoreMessage, CoreTool, GenerateTextResult, LanguageModel } from "ai"
import { Result } from "pratica"
import { GenAIError } from "../error/gen-ai.error"
import { CallSettings } from "../types/types"

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
