import { NotFoundError } from "src/error/not-found.error"
import { DomainAvailabilityError } from "./domain-availability.error"

export type ActionAAsyncError = DomainAvailabilityError | NotFoundError
