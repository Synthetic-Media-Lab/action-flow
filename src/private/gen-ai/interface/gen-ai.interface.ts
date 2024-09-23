import {
    CoreAssistantMessage,
    CoreMessage,
    CoreTool,
    CoreToolMessage,
    generateObject,
    GenerateTextResult,
    JSONValue,
    LanguageModel,
    Schema
} from "ai"
import { Result } from "neverthrow"
import { GenAIError } from "../error/gen-ai.error"
import { CallSettings } from "../types/types"
import { ZodType, ZodTypeDef } from "zod"

/* Generate Text */

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

/* Generate Object */

export type GenerateObjectOptionsWithSchema<OBJECT> = Omit<
    Parameters<typeof generateObject>[0],
    "schema" | "output" | "model"
> & {
    schema: ZodType<OBJECT> | Schema<OBJECT>
    output: "object"
}

export type GenerateObjectOptionsNoSchema = Omit<
    Parameters<typeof generateObject>[0],
    "schema" | "output" | "model"
> & {
    output: "no-schema"
}

export type GenerateObjectOptions<OBJECT extends JSONValue> =
    | GenerateObjectOptionsWithSchema<OBJECT>
    | GenerateObjectOptionsNoSchema

export interface AIObjectRequestBody {
    schema?: ZodType<JSONValue, ZodTypeDef, JSONValue> | Schema<JSONValue>
    prompt: string
    model: LanguageModel
}

export interface IGenerateObject {
    generateObject<OBJECT extends JSONValue>(
        options: GenerateObjectOptions<OBJECT>
    ): Promise<Result<Awaited<ReturnType<typeof generateObject>>, GenAIError>>
}

/* Interface composition */

export interface IGenAI<TOOLS extends Record<string, CoreTool>>
    extends IGenerateText<TOOLS>,
        IGenerateObject {}
