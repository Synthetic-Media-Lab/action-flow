import { Module } from "@nestjs/common"
import { TrademarkController } from "./trademark.controller"
import { trademarkServiceProvider } from "./trademark.providers"
import { OAuth2Module } from "src/private/oauth2/oauth2.module"
import { FetchModule } from "src/private/fetch/fetch.module"
import { ConfigModule } from "@nestjs/config"
import { RetryModule } from "src/private/retry/retry.module"
import { CloudStorageModule } from "src/private/cloud-storage/cloud-storage.module"

@Module({
    imports: [
        ConfigModule,
        OAuth2Module,
        CloudStorageModule,
        FetchModule,
        RetryModule
    ],
    controllers: [TrademarkController],
    providers: [trademarkServiceProvider],
    exports: [trademarkServiceProvider]
})
export class TrademarkModule {}
