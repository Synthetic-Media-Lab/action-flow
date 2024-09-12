import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import appConfig from "./app-config"
import { AppController } from "./app.controller"
import { AppService } from "./app.service"
import { AIModule } from "./private/ai/ai.module"
import { FetchModule } from "./private/fetch/fetch.module"
import { GenAIModule } from "./private/gen-ai/gen-ai.module"
import { GoogleSheetModule } from "./private/google-sheet/google-sheet.module"
import { OAuth2Module } from "./private/oauth2/oauth2.module"
import { PuppeteerModule } from "./private/puppeteer/puppeteer.module"
import { ActionAModule } from "./public/actions/action-a/action-a.module"

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true
        }),
        FetchModule,
        OAuth2Module,
        PuppeteerModule,
        ActionAModule,
        AIModule,
        GenAIModule,
        GoogleSheetModule
    ],
    controllers: [AppController],
    providers: [AppService, ...appConfig],
    exports: [ConfigModule]
})
export class AppModule {}
