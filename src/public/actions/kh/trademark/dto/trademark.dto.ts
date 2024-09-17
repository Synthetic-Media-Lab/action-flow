import { IsArray, IsEnum, IsOptional, IsString } from "class-validator"
import { EuipoTrademarkStatus } from "../interface/ITrademark"

export class CheckTrademarkDto {
    @IsString()
    name: string

    @IsArray()
    @IsOptional()
    niceClasses?: number[] = []

    @IsArray()
    @IsOptional()
    @IsEnum(EuipoTrademarkStatus, { each: true })
    statusesToExclude?: EuipoTrademarkStatus[] = []
}
