import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { CloudStorageController } from "./cloud-storage.controller"
import { CloudStorageProviders } from "./cloud-storage.providers"
import { CloudStorageService } from "./google-cloud-storage.service"

@Module({
    imports: [ConfigModule],
    controllers: [CloudStorageController],
    providers: [CloudStorageService, ...CloudStorageProviders],
    exports: [CloudStorageService, ...CloudStorageProviders]
})
export class CloudStorageModule {}
