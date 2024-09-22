import { Injectable, Logger } from "@nestjs/common"
import { err, ok, Result } from "neverthrow"
import { RetryService } from "../retry/retry.service"
import { IOAuth2Service, OAuthToken } from "./interface/oauth2.interface"
import { AuthorizationCodeStrategy } from "./strategies/authorization-code.strategy"
import { ClientCredentialsStrategy } from "./strategies/client-credentials.strategy"
import { UnauthorizedError } from "src/error/unauthorized.error"
import { AppError } from "src/error"

@Injectable()
export class OAuth2Service implements IOAuth2Service {
    private readonly logger = new Logger(OAuth2Service.name)
    private token: string = ""
    private tokenExpiry: Date = new Date(0)

    constructor(
        private readonly clientCredentialsStrategy: ClientCredentialsStrategy,
        private readonly authorizationCodeStrategy: AuthorizationCodeStrategy,
        private readonly retryService: RetryService
    ) {}

    // Client Credentials Flow
    async getAccessToken<T extends OAuthToken>(): Promise<
        Result<T, Error | UnauthorizedError>
    > {
        this.logger.debug("Starting getAccessToken process")

        if (this.token && this.tokenExpiry && this.tokenExpiry > new Date()) {
            this.logger.debug(`Using cached token: ${this.token}`)
            this.logger.debug(`Token expiry time: ${this.tokenExpiry}`)

            return ok({
                access_token: this.token,
                expires_in: this.tokenExpiry.getTime()
            } as T)
        }

        this.logger.debug("No valid cached token found, requesting new token")

        const tokenResult = await this.retryService.retry<
            Result<T, Error | UnauthorizedError>,
            AppError
        >(() => this.clientCredentialsStrategy.getAccessToken(), {
            retries: 5,
            delay: 1000,
            retryOnResult: (result: Result<T, Error | UnauthorizedError>) =>
                result.match(
                    () => false,
                    error => error instanceof UnauthorizedError
                )
        })

        return tokenResult.match(
            token => {
                this.logger.debug(
                    "Received new access token:",
                    token.access_token
                )
                this.logger.debug(
                    `Token expires in: ${token.expires_in} seconds`
                )

                this.token = token.access_token
                this.tokenExpiry = new Date(
                    Date.now() + (token.expires_in - 60) * 1000
                )
                this.logger.debug(
                    `Token expiry date set to: ${this.tokenExpiry}`
                )

                return ok(token as T)
            },
            error => {
                this.logger.error(
                    `Error retrieving access token: ${error.message}`
                )
                return err(error)
            }
        )
    }

    // Authorization Code Flow
    async getAccessTokenWithAuthCode<T extends OAuthToken>(
        code: string,
        redirectUri: string
    ): Promise<Result<T, Error>> {
        const tokenResult =
            await this.authorizationCodeStrategy.getAccessTokenWithAuthCode<T>(
                code,
                redirectUri
            )

        return tokenResult.match(
            token => {
                this.token = token.access_token
                this.tokenExpiry = new Date(
                    Date.now() + (token.expires_in - 60) * 1000
                )
                return ok(token as T)
            },
            error => err(error)
        )
    }

    // Refresh Token Flow
    async refreshAccessToken<T extends OAuthToken>(
        refreshToken: string
    ): Promise<Result<T, Error>> {
        const tokenResult =
            await this.authorizationCodeStrategy.refreshAccessToken<T>(
                refreshToken
            )

        return tokenResult.match(
            token => {
                this.token = token.access_token
                this.tokenExpiry = new Date(
                    Date.now() + (token.expires_in - 60) * 1000
                )
                return ok(token as T)
            },
            error => err(error)
        )
    }
}
