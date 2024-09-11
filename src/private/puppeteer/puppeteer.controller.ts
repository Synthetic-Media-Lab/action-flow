import { Controller, Get, Logger, Query, HttpException } from "@nestjs/common"
import { PuppeteerService } from "./puppeteer.service"
import { Result } from "pratica"
import { ITakeScreenshotOptions } from "./interface/puppeteer.interface"

@Controller("puppeteer")
export class PuppeteerController {
    private readonly logger = new Logger(PuppeteerController.name)

    constructor(private readonly puppeteerService: PuppeteerService) {}

    @Get("test-check-page")
    async checkPageContent(): Promise<string> {
        this.logger.debug("Request to check page content received.")

        const result: Result<string, Error> =
            await this.puppeteerService.testCheckPageContent()

        return result.cata({
            Ok: (message: string) => message,
            Err: (error: Error) => {
                this.logger.error(
                    `Error checking page content: ${error.message}`
                )
                throw new HttpException("Failed to check page content", 500)
            }
        })
    }

    @Get("search-google")
    async searchGoogle(@Query("q") query: string): Promise<string[]> {
        this.logger.debug(`Request to search Google for: ${query}`)

        const result: Result<string[], Error> =
            await this.puppeteerService.searchGoogle(query)

        return result.cata({
            Ok: (searchResults: string[]) => searchResults,
            Err: (error: Error) => {
                this.logger.error(
                    `Error during Google search: ${error.message}`
                )
                throw new HttpException("Failed to search Google", 500)
            }
        })
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

        const options: ITakeScreenshotOptions = {
            url,
            width: widthInt,
            height: heightInt
        }

        const result: Result<string, Error> =
            await this.puppeteerService.takeScreenshot(options)

        return result.cata({
            Ok: (path: string) => `Screenshot saved at: ${path}`,
            Err: (error: Error) => {
                this.logger.error(`Error taking screenshot: ${error.message}`)
                throw new HttpException("Failed to take screenshot", 500)
            }
        })
    }
}
