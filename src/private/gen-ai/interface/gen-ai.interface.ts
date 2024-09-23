import {
    CoreMessage,
    CoreTool,
    generateObject,
    generateText,
    JSONValue,
    LanguageModel,
    Schema
} from "ai"
import { Result } from "neverthrow"
import { ZodType } from "zod"
import { GenAIError } from "../error/gen-ai.error"

export type GenerateTextOptions<TOOLS extends Record<string, CoreTool>> = Omit<
    Parameters<typeof generateText>[0],
    "model"
> & {
    model?: LanguageModel
    tools?: TOOLS
}

export interface IGenerateText<TOOLS extends Record<string, CoreTool>> {
    generateText(
        messages: CoreMessage[],
        options?: GenerateTextOptions<TOOLS>
    ): Promise<Result<Awaited<ReturnType<typeof generateText>>, GenAIError>>
}

/* Generate Object */

export type GenerateObjectOptionsWithSchema<OBJECT> = Omit<
    Parameters<typeof generateObject>[0],
    "schema" | "output" | "model"
> & {
    schema: ZodType<OBJECT> | Schema<OBJECT>
    output: "object"
    model?: LanguageModel
}

export type GenerateObjectOptionsNoSchema = Omit<
    Parameters<typeof generateObject>[0],
    "schema" | "output" | "model"
> & {
    output: "no-schema"
    model?: LanguageModel
}

export type GenerateObjectOptions<OBJECT extends JSONValue> =
    | GenerateObjectOptionsWithSchema<OBJECT>
    | GenerateObjectOptionsNoSchema

export interface IGenerateObject {
    generateObject<OBJECT extends JSONValue>(
        options: GenerateObjectOptions<OBJECT>
    ): Promise<Result<Awaited<ReturnType<typeof generateObject>>, GenAIError>>
}

/* Interface composition */

export interface IGenAI<TOOLS extends Record<string, CoreTool>>
    extends IGenerateText<TOOLS>,
        IGenerateObject {}
