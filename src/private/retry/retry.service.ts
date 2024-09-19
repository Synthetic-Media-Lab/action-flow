import { Injectable, Logger } from "@nestjs/common"
import { IRetry, IRetryOptions } from "./interface/retry.interface"

@Injectable()
export class RetryService implements IRetry {
    private readonly logger = new Logger(RetryService.name)

    async retry<T = unknown, E extends Error = Error>(
        fn: () => Promise<T>,
        options: IRetryOptions<T, E>
    ): Promise<T> {
        const retries = Math.max(0, options.retries)
        const delay = Math.max(0, options.delay || 0)
        const timeout = options.timeout ? Date.now() + options.timeout : null

        const attempt = async (retriesLeft: number): Promise<T> => {
            if (timeout && Date.now() > timeout) {
                this.logger.debug(`Retry timeout exceeded`)
                throw new Error("Retry timeout exceeded")
            }

            try {
                this.logger.debug(
                    `Attempting function, retries left: ${retriesLeft}`
                )

                const result = await fn()

                if (options.retryOnResult && options.retryOnResult(result)) {
                    if (retriesLeft > 0) {
                        const currentDelay = options.exponentialBackoff
                            ? delay * (retries - retriesLeft + 1)
                            : delay

                        this.logger.debug(
                            `Retrying in ${currentDelay}ms... Retries left: ${retriesLeft - 1}`
                        )

                        if (currentDelay) {
                            await this.delay(currentDelay)
                        }

                        return attempt(retriesLeft - 1)
                    } else {
                        this.logger.debug(
                            `No retries left for retryable result. Returning result: ${result}`
                        )
                    }
                }

                return result
            } catch (error) {
                this.logger.debug(
                    `Error encountered: ${error.message}. Retries left: ${retriesLeft}`
                )

                const shouldRetry =
                    !options.retryOnError || options.retryOnError(error as E)

                if (!shouldRetry || retriesLeft <= 0) {
                    this.logger.debug(
                        `No retries left or error is not retryable. Throwing error: ${error.message}`
                    )
                    throw error
                }

                const currentDelay = options.exponentialBackoff
                    ? delay * (retries - retriesLeft + 1)
                    : delay

                this.logger.debug(
                    `Retrying in ${currentDelay}ms... Retries left: ${retriesLeft - 1}`
                )

                if (currentDelay) {
                    await this.delay(currentDelay)
                }

                return attempt(retriesLeft - 1)
            }
        }

        return attempt(retries)
    }

    public async delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms))
    }
}
