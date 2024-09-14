import { Module } from "@nestjs/common"
import { TrademarkController } from "./trademark.controller"
import { trademarkServiceProvider } from "./trademark.providers"

@Module({
    imports: [],
    controllers: [TrademarkController],
    providers: [trademarkServiceProvider],
    exports: [trademarkServiceProvider]
})
export class TrademarkModule {}
