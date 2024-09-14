import { TrademarkService } from "./trademark.service"

export const TRADEMARK_SERVICE_TOKEN = "TRADEMARK_SERVICE_TOKEN"

export const trademarkServiceProvider = {
    provide: TRADEMARK_SERVICE_TOKEN,
    useClass: TrademarkService
}
