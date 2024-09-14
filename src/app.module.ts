import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import appConfig from "./app-config"
import { AppController } from "./app.controller"
import { AppService } from "./app.service"
import { FetchModule } from "./private/fetch/fetch.module"
import { GenAIModule } from "./private/gen-ai/gen-ai.module"
import { OAuth2Module } from "./private/oauth2/oauth2.module"
import { ActionAModule } from "./public/actions/action-a/action-a.module"
import { DomainAvailabilityModule } from "./public/actions/kh/domain-availability/domain-availability.module"

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true
        }),
        FetchModule,
        OAuth2Module,
        GenAIModule,
        ActionAModule,
        DomainAvailabilityModule
    ],
    controllers: [AppController],
    providers: [AppService, ...appConfig],
    exports: [ConfigModule]
})
export class AppModule {}
