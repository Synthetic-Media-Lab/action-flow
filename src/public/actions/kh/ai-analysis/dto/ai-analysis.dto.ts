import { IsString } from "class-validator"

export class AiAnalysisDto {
    @IsString()
    text: string
}
