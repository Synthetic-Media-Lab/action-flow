import { Transform, Type } from "class-transformer"
import {
    IsArray,
    IsEnum,
    IsInt,
    IsObject,
    IsOptional,
    IsString,
    Max,
    Min,
    ValidateNested
} from "class-validator"
import { IEuipoTrademarksResult } from "../interface/IEuipoTrademarksResult"
import {
    EuipoTrademarkSearchStrategy,
    EuipoTrademarkStatus
} from "../interface/ITrademark"

export class CheckTrademarkDto {
    @IsString()
    name: string = ""

    @IsArray()
    @IsOptional()
    @Transform(({ value }) =>
        value
            ? Array.isArray(value)
                ? value.map(Number)
                : [Number(value)]
            : []
    )
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
        value
            ? Array.isArray(value)
                ? value.map((status: string) => status.toUpperCase())
                : [value.toUpperCase()]
            : []
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

export class UploadEuipoResultDto<T = unknown> {
    @IsObject()
    @ValidateNested()
    @Type(() => EuipoTrademarksResultDto)
    euipoTrademarksResult: IEuipoTrademarksResult<T> = { trademarks: [] }

    @IsString()
    googleSheetBrandSelection: string = ""
}

class EuipoTrademarksResultDto<T = unknown>
    implements IEuipoTrademarksResult<T>
{
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Object)
    trademarks: T[] = []
}
