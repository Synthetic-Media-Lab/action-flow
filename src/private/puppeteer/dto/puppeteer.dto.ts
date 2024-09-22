import {
    IsArray,
    IsIn,
    IsNumber,
    IsOptional,
    IsString,
    ArrayNotEmpty,
    ArrayMinSize,
    ValidateNested
} from "class-validator"
import { Type } from "class-transformer"

export class CheckTrademarkDto {
    @IsString()
    brand: string = ""

    @IsOptional()
    @IsString()
    url?: string

    @IsOptional()
    @IsIn(["embedded", "fuzzy"])
    searchStrategy?: "embedded" | "fuzzy"

    @IsOptional()
    @IsNumber()
    width?: number // Optional width for the browser window

    @IsOptional()
    @IsNumber()
    height?: number // Optional height for the browser window

    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => Number)
    industryClasses?: number[]
}
