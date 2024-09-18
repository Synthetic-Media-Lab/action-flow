import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { OAuth2Service } from "./oauth2.service"
import { FetchModule } from "../fetch/fetch.module"
import { OAuth2Controller } from "./oauth2.controller"
import { ClientCredentialsStrategy } from "./strategies/client-credentials.strategy"
import { AuthorizationCodeStrategy } from "./strategies/authorization-code.strategy"
import { RetryModule } from "../retry/retry.module"

@Module({
    imports: [ConfigModule, FetchModule, RetryModule],
    providers: [
        OAuth2Service,
        ClientCredentialsStrategy,
        AuthorizationCodeStrategy
    ],
    controllers: [OAuth2Controller],
    exports: [OAuth2Service]
})
export class OAuth2Module {}
