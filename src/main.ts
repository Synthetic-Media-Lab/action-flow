import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { Logger } from "@nestjs/common"

async function bootstrap() {
    const logger = new Logger("Bootstrap")

    const app = await NestFactory.create(AppModule, {
        bufferLogs: true
    })

    app.useLogger(logger)

    const PORT = app.get("PORT")

    logger.log(`Node environment -> ${process.env.NODE_ENV}`)
    logger.log(`App is listening at port -> ${PORT}`)

    await app.listen(PORT)
}

bootstrap()
