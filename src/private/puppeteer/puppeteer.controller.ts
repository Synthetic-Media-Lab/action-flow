import { Controller, Get, HttpException, Logger, Query } from "@nestjs/common"
import { Result } from "neverthrow"
import { PuppeteerService } from "./puppeteer.service"

@Controller("puppeteer")
export class PuppeteerController {
    private readonly logger = new Logger(PuppeteerController.name)

    constructor(private readonly puppeteerService: PuppeteerService) {}

    @Get("test-check-page")
    async checkPageContent(): Promise<string> {
        this.logger.debug("Request to check page content received.")

        const result: Result<string, Error> =
            await this.puppeteerService.testCheckPageContent()

        return result.match(
            (message: string) => message,
            (error: Error) => {
                this.logger.error(
                    `Error checking page content: ${error.message}`
                )
                throw new HttpException("Failed to check page content", 500)
            }
        )
    }

    @Get("take-screenshot")
    async takeScreenshot(
        @Query("url") url: string,
        @Query("width") width?: string,
        @Query("height") height?: string
    ): Promise<string> {
        const widthInt = width ? parseInt(width, 10) : undefined
        const heightInt = height ? parseInt(height, 10) : undefined

        this.logger.debug(
            `Request to take screenshot of: ${url} with dimensions ${widthInt}x${heightInt}`
        )

        const options = { url, width: widthInt, height: heightInt }

        const result: Result<string, Error> =
            await this.puppeteerService.takeScreenshot(options)

        return result.match(
            (screenshotPath: string) => {
                this.logger.debug(`Screenshot saved at: ${screenshotPath}`)
                return screenshotPath
            },
            (error: Error) => {
                this.logger.error(`Error taking screenshot: ${error.message}`)
                throw new HttpException("Failed to take screenshot", 500)
            }
        )
    }
}
