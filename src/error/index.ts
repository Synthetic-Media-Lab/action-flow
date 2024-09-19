import { NotFoundError } from "./not-found.error"
import { UnauthorizedError } from "./unauthorized.error"
import { FetchError } from "./fetch.error"
import { ValidationError } from "./validation.error"
import { InvalidInputError } from "./invalid-input.error"

export type AppError =
    | ValidationError
    | NotFoundError
    | UnauthorizedError
    | InvalidInputError
    | FetchError
