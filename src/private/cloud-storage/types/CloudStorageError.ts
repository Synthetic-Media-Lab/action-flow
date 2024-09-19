import { InvalidInputError } from "src/error/invalid-input.error"
import { NotFoundError } from "src/error/not-found.error"

export type CloudStorageError = InvalidInputError | NotFoundError
