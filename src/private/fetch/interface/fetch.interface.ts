import { Result } from "neverthrow"
import { FetchError } from "../../../error/fetch.error"

export interface IFetchService {
    json<T>(
        input: RequestInfo,
        init?: RequestInit
    ): Promise<Result<T, FetchError>>

    html(
        input: RequestInfo,
        init?: RequestInit
    ): Promise<Result<string, FetchError>>
}
