import { CoreMessage } from "ai"
import { Type } from "class-transformer"
import { IsArray, IsOptional, IsString, ValidateNested } from "class-validator"

export class CreateAICustomPromptDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CoreMessageDto)
    messages: CoreMessage[]

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

class CoreMessageDto {
    @IsString()
    role: "system" | "user" | "assistant" | "tool"

    @IsString()
    content: string
}
