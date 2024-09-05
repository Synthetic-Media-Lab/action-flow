import { NotFoundError } from "src/error/not-found.error"

export type GoogleSheetError = Error | NotFoundError
