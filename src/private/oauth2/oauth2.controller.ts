import { Controller, Get, Query, Redirect } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { AuthCodeDto } from "./dto/auth-code.dto"
import { OAuth2Service } from "./oauth2.service"

@Controller("oauth2")
export class OAuth2Controller {
    constructor(
        private readonly configService: ConfigService,
        private readonly oauth2Service: OAuth2Service
    ) {}

    @Get("authorize")
    @Redirect()
    authorize() {
        const clientId = this.configService.get<string>("OAUTH_CLIENT_ID")
        const redirectUri = this.configService.get<string>("OAUTH_REDIRECT_URI")
        const scope =
            this.configService.get<string>("OAUTH_SCOPE") || "openid profile"
        const authUrlBase = this.configService.get<string>(
            "OAUTH_AUTHORIZE_URL"
        )

        if (!clientId || !redirectUri || !authUrlBase) {
            throw new Error("Missing OAuth configuration")
        }

        const authUrl = `${authUrlBase}?response_type=code&client_id=${encodeURIComponent(
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

        return tokenResult.match(
            accessToken => ({ accessToken }),
            error => {
                throw error // Handle errors based on your preferred strategy
            }
        )
    }

    // Optional endpoint to refresh token
    // @Post('refresh')
    // async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    //   const { refresh_token } = refreshTokenDto;
    //   const tokenResult = await this.oauth2Service.refreshAccessToken(refresh_token);

    //   return tokenResult.match(
    //     (accessToken) => ({ accessToken }),
    //     (error) => {
    //       throw error; // Handle errors based on your preferred strategy
    //     },
    //   });
    // }
}
