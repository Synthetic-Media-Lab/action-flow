import { NotFoundError } from "./not-found.error"
import { UnauthorizedError } from "./unauthorized.error"
import { FetchError } from "./fetch.error"
import { ValidationError } from "./validation.error"

export type AppError =
    | ValidationError
    | NotFoundError
    | UnauthorizedError
    | FetchError
