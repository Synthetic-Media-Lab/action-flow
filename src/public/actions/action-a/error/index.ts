import { NotFoundError } from "src/error/not-found.error"
import { ActionAError } from "./action-a.error"

export type ActionAAsyncError = ActionAError | NotFoundError
