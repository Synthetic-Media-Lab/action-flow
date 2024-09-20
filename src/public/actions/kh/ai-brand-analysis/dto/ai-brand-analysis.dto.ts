import { IsString } from "class-validator"

export class AiBrandAnalysisDto {
    @IsString()
    text: string

    @IsString()
    brand: string
}
