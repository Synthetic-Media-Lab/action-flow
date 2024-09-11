import { Injectable, Logger } from "@nestjs/common"
import puppeteer from "puppeteer"
import { Result, Ok, Err } from "pratica"
import { ConfigService } from "@nestjs/config"
import {
    IPuppeteerService,
    ITakeScreenshotOptions
} from "./interface/puppeteer.interface"

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
            const visibleContent = pageContent.substring(0, 1000)

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

    async searchGoogle(searchTerm: string): Promise<Result<string[], Error>> {
        try {
            this.logger.debug(
                `Launching Puppeteer for Google search: ${searchTerm}`
            )

            const browser = await puppeteer.launch({
                headless: true, // Keep headless mode since non-headless won't work in non-GUI environments
                args: ["--no-sandbox", "--disable-setuid-sandbox"],
                executablePath: this.isLocal
                    ? undefined
                    : this.chromeExecutablePath
            })

            const page = await browser.newPage()
            this.logger.debug("Navigating to Google homepage...")
            await page.goto("https://www.google.com", {
                timeout: 60000, // Increased timeout to 60 seconds
                waitUntil: "networkidle2" // Wait until the network is idle
            })

            // Take screenshot after the page loads
            const screenshotPathBefore = `/tmp/google_home_before_search_${Date.now()}.png`
            await page.screenshot({ path: screenshotPathBefore })
            this.logger.debug(
                `Screenshot before entering search term: ${screenshotPathBefore}`
            )

            // Wait for the search textarea element
            await page.waitForSelector('textarea[aria-label="Search"]', {
                timeout: 30000
            })
            this.logger.debug("Google homepage loaded, entering search term...")

            // Type the search term into the Google search bar
            await page.type('textarea[aria-label="Search"]', searchTerm)

            // Take screenshot after entering the search term
            const screenshotPathAfter = `/tmp/google_home_after_search_${Date.now()}.png`
            await page.screenshot({ path: screenshotPathAfter })
            this.logger.debug(
                `Screenshot after entering search term: ${screenshotPathAfter}`
            )

            // Submit the search form and wait for navigation
            this.logger.debug("Submitting search form...")
            await Promise.all([
                page.keyboard.press("Enter"),
                page.waitForNavigation({
                    timeout: 60000, // Increased navigation timeout to 60 seconds
                    waitUntil: "networkidle2"
                })
            ])

            // Take screenshot after navigating to the search results
            const screenshotPathResults = `/tmp/google_search_results_${Date.now()}.png`
            await page.screenshot({ path: screenshotPathResults })
            this.logger.debug(
                `Screenshot after search results: ${screenshotPathResults}`
            )

            // Extract the search result titles
            this.logger.debug("Extracting search results...")
            const searchResults = await page.evaluate(() => {
                const results: string[] = []
                document.querySelectorAll("h3").forEach(item => {
                    results.push(item.innerText)
                })
                return results
            })

            await browser.close()
            return Ok(searchResults)
        } catch (error) {
            this.logger.error(
                `Failed to search Google: ${error.message}`,
                error.stack
            )
            return Err(new Error("Failed to search Google"))
        }
    }

    async takeScreenshot(
        options: ITakeScreenshotOptions
    ): Promise<Result<string, Error>> {
        const { url, width = 1920, height = 1080 } = options

        try {
            this.logger.debug(
                `Launching Puppeteer to take a screenshot of: ${url} with dimensions ${width}x${height}`
            )

            const browser = await puppeteer.launch({
                headless: true,
                args: ["--no-sandbox", "--disable-setuid-sandbox"],
                executablePath: this.isLocal
                    ? undefined
                    : this.chromeExecutablePath
            })

            const page = await browser.newPage()

            await page.setViewport({ width, height })
            this.logger.debug(`Navigating to ${url}...`)

            await page.goto(url, {
                timeout: 60000,
                waitUntil: "networkidle2"
            })

            const screenshotPath = `./screenshots/screenshot_${Date.now()}.png`
            await page.screenshot({ path: screenshotPath })
            this.logger.debug(`Screenshot saved at: ${screenshotPath}`)

            await browser.close()
            return Ok(screenshotPath)
        } catch (error) {
            this.logger.error(
                `Failed to take screenshot: ${error.message}`,
                error.stack
            )
            return Err(new Error("Failed to take screenshot"))
        }
    }
}
