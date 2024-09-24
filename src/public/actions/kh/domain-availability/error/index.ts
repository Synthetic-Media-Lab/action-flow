import { NotFoundError } from "src/error/not-found.error"

export type DomainAvailabilityError = Error | NotFoundError
