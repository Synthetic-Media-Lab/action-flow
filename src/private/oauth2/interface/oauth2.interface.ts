import { Result } from "pratica"

export interface IOAuth2Service {
    getAccessToken<T extends OAuthToken>(): Promise<Result<T, Error>>
    getAccessTokenWithAuthCode<T extends OAuthToken>(
        code: string,
        redirectUri: string
    ): Promise<Result<T, Error>>
    refreshAccessToken<T extends OAuthToken>(
        refreshToken: string
    ): Promise<Result<T, Error>>
}

export type OAuthToken = { access_token: string; expires_in: number }
