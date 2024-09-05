import { Module } from "@nestjs/common"
import { GoogleSheetController } from "./google-sheet.controller"
import { googleSheetServiceProvider } from "./google-sheet.providers"

@Module({
    controllers: [GoogleSheetController],
    providers: [googleSheetServiceProvider],
    exports: [googleSheetServiceProvider]
})
export class GoogleSheetModule {}
