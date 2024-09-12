import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { EUIPOService } from "./euipo.service"
import { OAuth2Service } from "./oauth2.service"
import { FetchModule } from "../fetch/fetch.module"
import { EUIPOController } from "./oauth2.controller"

@Module({
    imports: [ConfigModule, FetchModule],
    providers: [EUIPOService, OAuth2Service],
    controllers: [EUIPOController]
})
export class OAuth2Module {}
