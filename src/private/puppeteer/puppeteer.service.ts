import { Injectable, Logger } from "@nestjs/common"
import puppeteer from "puppeteer"
import { Result, Ok, Err } from "pratica"
import { ConfigService } from "@nestjs/config"
import { IPuppeteerService } from "./interface/puppeteer.interface"

@Injectable()
export class PuppeteerService implements IPuppeteerService {
    private readonly logger = new Logger(PuppeteerService.name)
    private readonly isLocal: boolean
    private readonly chromeExecutablePath: string | undefined

    constructor(private readonly configService: ConfigService) {
        this.isLocal =
            this.configService.get<string>("NODE_ENV") !== "production"
        this.chromeExecutablePath = this.configService.get<string>(
            "CHROME_EXECUTABLE_PATH",
            "/usr/bin/google-chrome-stable"
        )
    }

    async searchGoogle(searchTerm: string): Promise<Result<string[], Error>> {
        try {
            this.logger.debug(
                `Launching Puppeteer to search Google for: ${searchTerm}`
            )

            const browser = await puppeteer.launch({
                headless: true,
                args: ["--no-sandbox", "--disable-setuid-sandbox"],
                executablePath: this.isLocal
                    ? undefined
                    : this.chromeExecutablePath
            })

            const page = await browser.newPage()

            // 1. Navigate to Google's homepage
            this.logger.debug("Navigating to Google homepage...")
            await page.goto("https://www.google.com", {
                timeout: 30000,
                waitUntil: "domcontentloaded"
            })

            // Wait for search input field
            await page.waitForSelector('input[title="Search"]', {
                timeout: 10000
            })
            this.logger.debug("Google homepage loaded, entering search term...")

            // 2. Type the search term into the Google search bar
            await page.type('input[title="Search"]', searchTerm)

            // 3. Press 'Enter' to submit the search form
            this.logger.debug("Submitting search form...")
            await Promise.all([
                page.keyboard.press("Enter"),
                page.waitForNavigation({
                    timeout: 30000,
                    waitUntil: "domcontentloaded"
                }) // Wait for the page to load after the search
            ])

            // 4. Extract the search result titles
            this.logger.debug("Extracting search results...")
            const searchResults = await page.evaluate(() => {
                const results = []
                const items = document.querySelectorAll("h3") // Adjust the selector if necessary
                items.forEach(item => {
                    results.push(item.innerText)
                })
                return results
            })

            await browser.close()

            // Return the list of search result titles wrapped in Ok
            return Ok(searchResults)
        } catch (error) {
            this.logger.error(
                `Failed to search Google: ${error.message}`,
                error.stack
            )

            // Handle specific error cases for debugging purposes
            if (error.message.includes("Timeout")) {
                this.logger.error(
                    "Timeout occurred while trying to load the page or submit the form."
                )
            } else if (error.message.includes("socket hang up")) {
                this.logger.error(
                    "Socket hang up likely due to network issues or connection reset."
                )
            }

            return Err(new Error("Failed to search Google"))
        }
    }

    async testCheckPageContent(): Promise<Result<string, Error>> {
        try {
            this.logger.debug("Launching Puppeteer to check page content...")

            const browser = await puppeteer.launch({
                headless: true,
                args: ["--no-sandbox", "--disable-setuid-sandbox"],
                executablePath: this.isLocal
                    ? undefined
                    : this.chromeExecutablePath
            })

            const page = await browser.newPage()

            this.logger.debug("Navigating to Google homepage...")

            await page.goto("https://www.google.com", {
                timeout: 10000,
                waitUntil: "networkidle2"
            })

            const pageContent = await page.content()

            const visibleContent = pageContent.substring(0, 500)

            await browser.close()

            return Ok(`Page content: ${visibleContent}`)
        } catch (error) {
            this.logger.error(
                `Failed to access page: ${error.message}`,
                error.stack
            )
            return Err(new Error("Failed to access page."))
        }
    }
}
