import { CoreMessage } from "ai"
import { Type } from "class-transformer"
import {
    IsArray,
    IsIn,
    IsObject,
    IsOptional,
    IsString,
    ValidateIf,
    ValidateNested
} from "class-validator"

export class AiGenerateTextDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CoreMessageDto)
    messages: CoreMessage[] = []

    @IsOptional()
    temperature?: number

    @IsOptional()
    maxTokens?: number

    @IsOptional()
    topP?: number

    @IsOptional()
    presencePenalty?: number

    @IsOptional()
    frequencyPenalty?: number

    @IsOptional()
    @IsArray()
    stopSequences?: string[]
}

export class CoreMessageDto {
    @IsIn(["system", "user", "assistant", "tool"])
    role: "system" | "user" | "assistant" | "tool" = "user"

    @ValidateIf(o => o.role !== "tool")
    @IsString()
    @ValidateIf(o => o.role === "tool")
    @IsObject()
    content:
        | string
        | { tool_name: string; tool_output: Record<string, unknown> } = ""
}

export class AiGenerateObjectDto {
    @IsString()
    prompt: string = ""
}
