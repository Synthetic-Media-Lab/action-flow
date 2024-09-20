import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import appConfig from "./app-config"
import { AppController } from "./app.controller"
import { AppService } from "./app.service"
import { FetchModule } from "./private/fetch/fetch.module"
import { GenAIModule } from "./private/gen-ai/gen-ai.module"
import { OAuth2Module } from "./private/oauth2/oauth2.module"
import { AiBrandAnalysisModule } from "./public/actions/kh/ai-brand-analysis/ai-brand-analysis.module"
import { DomainAvailabilityModule } from "./public/actions/kh/domain-availability/domain-availability.module"
import { TrademarkModule } from "./public/actions/kh/trademark/trademark.module"
import { RetryModule } from "./private/retry/retry.module"
import { CloudStorageModule } from "./private/cloud-storage/cloud-storage.module"
import { EventEmitterModule } from "@nestjs/event-emitter"

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true
        }),
        EventEmitterModule.forRoot(),
        RetryModule,
        FetchModule,
        OAuth2Module,
        GenAIModule,
        DomainAvailabilityModule,
        TrademarkModule,
        CloudStorageModule,
        AiBrandAnalysisModule
    ],
    controllers: [AppController],
    providers: [AppService, ...appConfig],
    exports: [ConfigModule]
})
export class AppModule {}
