import { IsString } from "class-validator"

export class CheckDomainAvailabilityDto {
    @IsString()
    domain: string
}
