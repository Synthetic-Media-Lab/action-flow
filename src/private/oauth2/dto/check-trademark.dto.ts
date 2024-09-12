import { IsIn, IsNumber, IsOptional, IsString } from "class-validator"

export class CheckTrademarkDto {
    @IsString()
    brand: string

    @IsOptional()
    @IsString()
    url?: string

    @IsOptional()
    @IsIn(["embedded", "fuzzy"])
    searchStrategy?: "embedded" | "fuzzy"

    @IsOptional()
    @IsNumber()
    width?: number

    @IsOptional()
    @IsNumber()
    height?: number
}
