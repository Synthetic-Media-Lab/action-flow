import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { Result, Ok, Err } from "pratica"
import { FetchService } from "../fetch/fetch.service"

@Injectable()
export class OAuth2Service implements OAuth2Service {
    private token: string
    private tokenExpiry: Date

    constructor(
        private readonly fetchService: FetchService,
        private readonly configService: ConfigService
    ) {}

    async getAccessToken(): Promise<Result<string, Error>> {
        if (this.token && this.tokenExpiry > new Date()) {
            return Ok(this.token)
        }

        const tokenUrl = this.configService.get<string>("OAUTH_TOKEN_URL")
        const body = new URLSearchParams({
            grant_type: "client_credentials",
            client_id: this.configService.get<string>("OAUTH_CLIENT_ID"),
            client_secret: this.configService.get<string>(
                "OAUTH_CLIENT_SECRET"
            ),
            scope: this.configService.get<string>("OAUTH_SCOPE")
        })

        const fetchResult = await this.fetchService.json<{
            access_token: string
            expires_in: number
        }>(tokenUrl, {
            method: "POST",
            body,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        })

        return fetchResult.cata({
            Ok: ({ access_token, expires_in }) => {
                this.token = access_token
                this.tokenExpiry = new Date(
                    Date.now() + (expires_in - 60) * 1000
                )
                return Ok(this.token)
            },
            Err: () => Err(new Error("Failed to retrieve access token"))
        })
    }
}
