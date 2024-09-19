export interface IRetryOptions<T = unknown, E extends Error = Error> {
    retries: number
    delay?: number
    exponentialBackoff?: boolean
    retryOnError?: (error: E) => boolean
    retryOnResult?: (result: T) => boolean
    timeout?: number
}

export interface IRetry {
    retry<T = unknown, E extends Error = Error>(
        fn: () => Promise<T>,
        options: IRetryOptions<T, E>
    ): Promise<T>
    delay(ms: number): Promise<void>
}
