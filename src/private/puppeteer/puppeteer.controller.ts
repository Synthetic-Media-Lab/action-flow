import { Controller, Get, Logger, Query, HttpException } from "@nestjs/common"
import { PuppeteerService } from "./puppeteer.service"
import { Result } from "pratica"

@Controller("puppeteer")
export class PuppeteerController {
    private readonly logger = new Logger(PuppeteerController.name)

    constructor(private readonly puppeteerService: PuppeteerService) {}

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
}
