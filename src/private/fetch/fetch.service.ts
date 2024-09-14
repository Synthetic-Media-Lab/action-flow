import { Injectable, Inject } from "@nestjs/common"
import { Ok, Err, Result } from "pratica"
import { FetchError } from "./error/fetch.error"
import { FETCH_TOKEN } from "./fetch.providers"
import { IFetchService } from "./interface/fetch.interface"

@Injectable()
export class FetchService implements IFetchService {
    constructor(
        @Inject(FETCH_TOKEN) private readonly nativeFetch: typeof fetch
    ) {}

    public async json<T>(
        input: RequestInfo,
        init?: RequestInit
    ): Promise<Result<T, FetchError>> {
        try {
            const response = await this.nativeFetch(input, init)

            console.log("response", response)

            if (!response.ok) {
                return Err(
                    new FetchError(
                        response.statusText || "Unknown error",
                        response.status
                    )
                )
            }

            const data = (await response.json()) as T
            return Ok(data)
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
