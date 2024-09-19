import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import appConfig from "./app-config"
import { AppController } from "./app.controller"
import { AppService } from "./app.service"
import { FetchModule } from "./private/fetch/fetch.module"
import { GenAIModule } from "./private/gen-ai/gen-ai.module"
import { OAuth2Module } from "./private/oauth2/oauth2.module"
import { AiAnalysisModule } from "./public/actions/kh/ai-analysis/ai-analysis.module"
import { DomainAvailabilityModule } from "./public/actions/kh/domain-availability/domain-availability.module"
import { TrademarkModule } from "./public/actions/kh/trademark/trademark.module"
import { RetryModule } from "./private/retry/retry.module"
import { CloudStorageModule } from "./private/cloud-storage/cloud-storage.module"

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true
        }),
        RetryModule,
        FetchModule,
        OAuth2Module,
        GenAIModule,
        DomainAvailabilityModule,
        TrademarkModule,
        CloudStorageModule,
        AiAnalysisModule
    ],
    controllers: [AppController],
    providers: [AppService, ...appConfig],
    exports: [ConfigModule]
})
export class AppModule {}
