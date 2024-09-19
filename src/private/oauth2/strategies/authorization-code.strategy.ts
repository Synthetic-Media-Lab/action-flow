import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { Result, ok, err } from "neverthrow"
import { FetchService } from "../../fetch/fetch.service"
import { OAuthToken } from "../interface/oauth2.interface"

@Injectable()
export class AuthorizationCodeStrategy {
    constructor(
        private readonly fetchService: FetchService,
        private readonly configService: ConfigService
    ) {}

    // Make the method generic
    async getAccessTokenWithAuthCode<T extends OAuthToken>(
        code: string,
        redirectUri: string
    ): Promise<Result<T, Error>> {
        const tokenUrl = this.configService.get<string>("OAUTH_TOKEN_URL")
        const clientId = this.configService.get<string>("OAUTH_CLIENT_ID")
        const clientSecret = this.configService.get<string>(
            "OAUTH_CLIENT_SECRET"
        )

        const body = new URLSearchParams({
            grant_type: "authorization_code",
            code: code,
            redirect_uri: redirectUri,
            client_id: clientId,
            client_secret: clientSecret
        })

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

    // Make the refresh method generic
    async refreshAccessToken<T extends OAuthToken>(
        refreshToken: string
    ): Promise<Result<T, Error>> {
        const tokenUrl = this.configService.get<string>("OAUTH_TOKEN_URL")
        const clientId = this.configService.get<string>("OAUTH_CLIENT_ID")
        const clientSecret = this.configService.get<string>(
            "OAUTH_CLIENT_SECRET"
        )

        const body = new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: refreshToken,
            client_id: clientId,
            client_secret: clientSecret
        })

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
                        `Failed to refresh access token: ${error.message}`
                    )
                )
        )
    }
}
