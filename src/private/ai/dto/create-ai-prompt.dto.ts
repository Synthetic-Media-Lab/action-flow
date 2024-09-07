import { IsString } from "class-validator"

export class CreateAIPromptDto {
    @IsString()
    prompt: string
}
