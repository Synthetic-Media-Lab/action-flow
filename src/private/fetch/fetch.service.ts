import { Injectable, Inject, Logger } from "@nestjs/common"
import { Ok, Err, Result } from "pratica"
import { FetchError } from "./error/fetch.error"
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
            this.logger.debug(
                "Response headers: ",
                JSON.stringify(response.headers)
            )
            this.logger.debug(
                "Response body used: ",
                JSON.stringify(response.bodyUsed)
            )

            if (!response.ok) {
                return Err(
                    new FetchError(
                        response.statusText || "Unknown error",
                        response.status
                    )
                )
            }

            const jsonResponse = await response.json()

            this.logger.debug("Response JSON: ", jsonResponse)

            return Ok(jsonResponse)
        } catch (error) {
            return Err(
                new FetchError((error as Error).message || "Fetch failed")
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

            if (
                !response.ok ||
                !response.headers.get("content-type")?.includes("text/html")
            ) {
                return Err(
                    new FetchError(
                        response.statusText || textBody || "Unknown error",
                        response.status
                    )
                )
            }

            return Ok(textBody)
        } catch (error) {
            return Err(
                new FetchError((error as Error).message || "Fetch failed")
            )
        }
    }
}
