import { Module } from "@nestjs/common"
import { GoogleSheetController } from "./google-sheet.controller"
import { googleSheetServiceProvider } from "./google-sheet.providers"
import { ConfigModule } from "@nestjs/config"

@Module({
    imports: [ConfigModule],
    controllers: [GoogleSheetController],
    providers: [googleSheetServiceProvider],
    exports: [googleSheetServiceProvider]
})
export class GoogleSheetModule {}
