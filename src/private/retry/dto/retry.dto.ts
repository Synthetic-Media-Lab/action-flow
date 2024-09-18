import { IsInt, IsOptional, Min } from "class-validator"

export class RetryOptionsDto {
    @IsInt()
    @Min(0)
    retries: number

    @IsOptional()
    @IsInt()
    @Min(0)
    delay?: number
}
