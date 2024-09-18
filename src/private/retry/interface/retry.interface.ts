export interface IRetryOptions<E extends Error = Error> {
    retries: number
    delay?: number
    exponentialBackoff?: boolean
    retryOn?: (error: E) => boolean
    timeout?: number
}

export interface IRetry {
    retry<T, E extends Error = Error>(
        fn: () => Promise<T>,
        options: IRetryOptions<E>
    ): Promise<T>
    delay(ms: number): Promise<void>
}
