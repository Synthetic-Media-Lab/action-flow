import { IsString, IsInt } from "class-validator"

export class UpdateCellDto {
    @IsString()
    sheetId: string = ""

    @IsString()
    sheetName: string = ""

    @IsInt()
    row: number = 0

    @IsString()
    column: string = ""

    @IsString()
    value: string = ""
}
