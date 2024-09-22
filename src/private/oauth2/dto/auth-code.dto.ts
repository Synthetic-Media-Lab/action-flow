import { IsString, IsNotEmpty } from "class-validator"

export class AuthCodeDto {
    @IsString()
    @IsNotEmpty()
    code: string = ""

    @IsString()
    @IsNotEmpty()
    redirect_uri: string = ""
}
