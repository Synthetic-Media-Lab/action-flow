export const formatErrorForLogging = (
    error: unknown
): { message: string; stack?: string } =>
    error instanceof Error
        ? { message: error.message, stack: error.stack }
        : { message: JSON.stringify(error) }
