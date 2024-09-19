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

            if (!response.ok) {
                return err(
                    new FetchError(
                        response.statusText || "Unknown error",
                        response.status
                    )
                )
            }

            const jsonResponse = await response.json()

            return ok(jsonResponse)
        } catch (error) {
            return err(
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
                new FetchError((error as Error).message || "Fetch failed")
            )
        }
    }
}
