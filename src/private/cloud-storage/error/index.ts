import { InvalidInputError } from "src/error/invalid-input.error"
import { NotFoundError } from "src/error/not-found.error"
import { ValidationError } from "src/error/validation.error"
import { GoogleSheetAPIError } from "./cloud-storage-error"

export type CloudStorageError =
    | InvalidInputError
    | NotFoundError
    | ValidationError
    | GoogleSheetAPIError
