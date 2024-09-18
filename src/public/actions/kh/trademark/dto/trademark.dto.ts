import {
    IsArray,
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    Max,
    Min
} from "class-validator"
import {
    EuipoTrademarkSearchStrategy,
    EuipoTrademarkStatus
} from "../interface/ITrademark"
import { Transform, Type } from "class-transformer"

export class CheckTrademarkDto {
    @IsString()
    name: string

    @IsArray()
    @IsOptional()
    niceClasses?: number[] = []

    @IsEnum(EuipoTrademarkSearchStrategy)
    @IsOptional()
    @Transform(({ value }) => value?.toUpperCase())
    searchStrategy?: EuipoTrademarkSearchStrategy =
        EuipoTrademarkSearchStrategy.EXACT

    @IsArray()
    @IsOptional()
    @IsEnum(EuipoTrademarkStatus, { each: true })
    @Transform(({ value }) =>
        value?.map((status: string) => status.toUpperCase())
    )
    statusesToExclude?: EuipoTrademarkStatus[] = []

    @IsInt()
    @IsOptional()
    @Min(10)
    @Max(100)
    @Type(() => Number)
    size?: number = 10

    @IsInt()
    @IsOptional()
    @Min(0)
    @Type(() => Number)
    page?: number = 0
}
