import { Module } from "@nestjs/common"
import { fetchProvider } from "./fetch.providers"
import { ConfigModule } from "@nestjs/config"
import { FetchService } from "./fetch.service"

@Module({
    imports: [ConfigModule],
    providers: [fetchProvider, FetchService],
    exports: [FetchService]
})
export class FetchModule {}
