import { Injectable, Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { err, ok, Result } from "neverthrow"
import { FetchService } from "../../fetch/fetch.service"
import { OAuthToken } from "../interface/oauth2.interface"
import { UnauthorizedError } from "src/error/unauthorized.error"

@Injectable()
export class ClientCredentialsStrategy {
    private readonly logger = new Logger(ClientCredentialsStrategy.name)

    constructor(
        private readonly fetchService: FetchService,
        private readonly configService: ConfigService
    ) {}

    public async getAccessToken<T extends OAuthToken = OAuthToken>(): Promise<
        Result<T, Error | UnauthorizedError>
    > {
        const tokenUrl = this.configService.get<string>("OAUTH_TOKEN_URL")
        const clientId = this.configService.get<string>("OAUTH_CLIENT_ID")
        const clientSecret = this.configService.get<string>(
            "OAUTH_CLIENT_SECRET"
        )
        const scope = this.configService.get<string>("OAUTH_SCOPE") || "uid"

        const body = new URLSearchParams({
            grant_type: "client_credentials",
            client_id: clientId,
            client_secret: clientSecret,
            scope: scope
        })

        this.logger.debug(
            `Requesting access token with body: ${body} at ${tokenUrl}`
        )

        // Fetch the token response, using the generic type T
        const fetchResult = await this.fetchService.json<T>(tokenUrl, {
            method: "POST",
            body,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        })

        return fetchResult.match(
            data => ok(data),
            error =>
                err(
                    new Error(
                        `Failed to retrieve access token: ${error.message}`
                    )
                )
        )
    }
}
