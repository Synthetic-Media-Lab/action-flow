import { ParseError } from "src/error/parse.error"
import { ValidationError } from "src/error/validation.error"

export type GenAIError = Error | ValidationError | ParseError
