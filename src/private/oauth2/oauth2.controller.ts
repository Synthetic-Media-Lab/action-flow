import { Controller, Get, Query, Redirect } from "@nestjs/common"
import { OAuth2Service } from "./oauth2.service"
import { ConfigService } from "@nestjs/config"
import { AuthCodeDto } from "./dto/auth-code.dto"

@Controller("oauth2")
export class OAuth2Controller {
    constructor(
        private readonly oauth2Service: OAuth2Service,
        private readonly configService: ConfigService
    ) {}

    @Get("authorize")
    @Redirect()
    authorize() {
        const clientId = this.configService.get<string>("OAUTH_CLIENT_ID")
        const redirectUri = this.configService.get<string>("OAUTH_REDIRECT_URI")
        const scope =
            this.configService.get<string>("OAUTH_SCOPE") || "openid profile"
        const authUrl = `${this.configService.get<string>(
            "OAUTH_AUTHORIZE_URL"
        )}?response_type=code&client_id=${encodeURIComponent(
            clientId
        )}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`

        return { url: authUrl }
    }

    @Get("callback")
    async callback(@Query() query: AuthCodeDto) {
        const { code, redirect_uri } = query
        const tokenResult = await this.oauth2Service.getAccessTokenWithAuthCode(
            code,
            redirect_uri
        )

        return tokenResult.cata({
            Ok: accessToken => ({ accessToken }),
            Err: error => {
                throw error // Handle errors based on your preferred strategy
            }
        })
    }

    // Optional endpoint to refresh token
    // @Post('refresh')
    // async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    //   const { refresh_token } = refreshTokenDto;
    //   const tokenResult = await this.oauth2Service.refreshAccessToken(refresh_token);

    //   return tokenResult.cata({
    //     Ok: (accessToken) => ({ accessToken }),
    //     Err: (error) => {
    //       throw error; // Handle errors based on your preferred strategy
    //     },
    //   });
    // }
}
