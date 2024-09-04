import { FactoryProvider } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"

const APP_CONFIG_PORT_TOKEN = "PORT"

const appConfigPort: FactoryProvider<number> = {
    provide: APP_CONFIG_PORT_TOKEN,
    useFactory: (configService: ConfigService) => {
        const port = configService.get<number>("PORT", 3000)

        return port
    },
    inject: [ConfigService]
}

const appConfig = [appConfigPort]

export default appConfig
