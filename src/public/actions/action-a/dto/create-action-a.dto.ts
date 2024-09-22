import { IsString, IsOptional } from "class-validator"

export class CreateActionADto {
    @IsString()
    actionId: string = ""

    @IsString()
    @IsOptional()
    description?: string
}
