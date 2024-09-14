import { IsString } from "class-validator"

export class CheckTrademarkDto {
    @IsString()
    name: string
}
