import { Module } from "@nestjs/common"
import { PuppeteerController } from "./puppeteer.controller"
import { PuppeteerService } from "./puppeteer.service"
import { ConfigModule } from "@nestjs/config"

@Module({
    imports: [ConfigModule],
    controllers: [PuppeteerController],
    providers: [PuppeteerService]
})
export class PuppeteerModule {}
