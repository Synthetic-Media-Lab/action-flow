import { IsString, IsOptional, IsNumber } from "class-validator"

export class CreateAICustomPromptDto {
    @IsString()
    prompt: string

    @IsOptional()
    @IsString()
    systemMessage?: string

    @IsOptional()
    @IsNumber()
    temperature?: number

    @IsOptional()
    @IsNumber()
    maxTokens?: number
}
