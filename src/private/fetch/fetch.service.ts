import { Inject, Injectable, Logger } from "@nestjs/common"
import { Result, err, ok } from "neverthrow"
import { FetchError } from "../../error/fetch.error"
import { FETCH_TOKEN } from "./fetch.providers"
import { IFetchService } from "./interface/fetch.interface"

@Injectable()
export class FetchService implements IFetchService {
    private readonly logger = new Logger(FetchService.name)

    constructor(
        @Inject(FETCH_TOKEN) private readonly nativeFetch: typeof fetch
    ) {}

    public async json<T>(
        input: RequestInfo,
        init?: RequestInit
    ): Promise<Result<T, FetchError>> {
        try {
            this.logger.debug(
                `Fetching JSON with configuration: ${JSON.stringify({ input, init })}`
            )

            const response = await this.nativeFetch(input, init)

            this.logger.debug(
                "Response status: ",
                JSON.stringify(response.status)
            )

            const responseBodyResult = await this.getResponseBody<T>(response)

            if (responseBodyResult.isErr()) {
                return err(
                    new FetchError(
                        response.statusText || "Unknown error",
                        response.status,
                        JSON.stringify(responseBodyResult.error)
                    )
                )
            }

            if (!response.ok) {
                return err(
                    new FetchError(
                        response.statusText || "Unknown error",
                        response.status,
                        JSON.stringify(responseBodyResult.value)
                    )
                )
            }

            return ok(responseBodyResult.value)
        } catch (error) {
            return err(
                new FetchError(
                    error instanceof Error ? error.message : "Unknown error"
                )
            )
        }
    }

    public async html(
        input: RequestInfo,
        init?: RequestInit
    ): Promise<Result<string, FetchError>> {
        try {
            const response = await this.nativeFetch(input, init)

            const textBody = await response.text()

            this.logger.debug(`Raw response body: ${textBody}`)

            const contentType = response.headers.get("content-type") || ""
            if (
                !response.ok ||
                !(
                    contentType.includes("text/html") ||
                    contentType.includes("application/xml") ||
                    contentType.includes("text/xml")
                )
            ) {
                return err(
                    new FetchError(
                        response.statusText || textBody || "Unknown error",
                        response.status
                    )
                )
            }

            return ok(textBody)
        } catch (error) {
            return err(
                new FetchError(
                    error instanceof Error ? error.message : "Unknown error"
                )
            )
        }
    }

    private async getResponseBody<T>(
        response: Response
    ): Promise<Result<T, FetchError>> {
        const contentType = response.headers.get("content-type") || ""

        try {
            if (contentType.includes("application/json")) {
                try {
                    const json = (await response.json()) as T

                    this.logger.debug("Parsed JSON:", json)

                    return ok(json)
                } catch (jsonError) {
                    this.logger.warn(
                        "Failed to parse JSON body:",
                        (jsonError as Error).message
                    )

                    return err(
                        new FetchError("Failed to parse JSON", response.status)
                    )
                }
            } else {
                this.logger.warn("Response content is not JSON")

                return err(
                    new FetchError("Response is not JSON", response.status)
                )
            }
        } catch (error) {
            if (error instanceof Error) {
                this.logger.error(
                    "Error processing response body:",
                    error.message
                )

                return err(
                    new FetchError("Error processing response", response.status)
                )
            }

            this.logger.error(
                "Error processing response body:",
                JSON.stringify(error)
            )

            return err(
                new FetchError("Error processing response", response.status)
            )
        }
    }
}
