import { NotFoundError } from "src/error/not-found.error"
import { TrademarkError } from "./trademark.error"

export type TrademarkErrorType = TrademarkError | NotFoundError
