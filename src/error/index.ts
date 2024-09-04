import { ValidationError } from "@nestjs/common"
import { NotFoundError } from "./not-found.error"

export type AppError = ValidationError | NotFoundError
