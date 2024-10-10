import { IsString, Matches } from "class-validator"

export class CheckDomainAvailabilityDto {
    @IsString()
    @Matches(/^[a-zA-Z0-9-]+$/, {
        message: "Domain name can only contain letters, numbers, and hyphens"
    })
    @Matches(/^(?!.*\.(com|se|fi|no)$).*$/, {
        message: "Domain name should not include a TLD (.com, .se, .fi, .no)"
    })
    domainName: string = ""
}
